import express from "express";
import multer from "multer";
import axios from "axios";
import mongoose from "mongoose";
import { authMiddleware } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import DocumentUpload from "../models/DocumentUpload.js";
import { getPrivateDocumentUrl, isCloudinaryConfigured, uploadDocument } from "../services/cloudinary.service.js";
import { isVirusScanRequired, scanDocument } from "../services/virusScan.service.js";

const router = express.Router();
const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const unsupportedMediaType = { message: "Unsupported file type. Upload a PDF, JPEG, or PNG file." };

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function matchesFileSignature(buffer, mimeType) {
  if (mimeType === "application/pdf") {
    return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  }
  if (mimeType === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  return false;
}

function parseDocumentUpload(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "Document must be 10 MB or smaller" });
    }
    if (error) return next(error);
    return next();
  });
}

// Stores a private asset and returns an opaque database ID, never a URL.
router.post("/document", authMiddleware, authorizeRole("beneficiary"), parseDocumentUpload, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "A PDF, JPEG, or PNG file is required" });
  }
  if (!allowedMimeTypes.has(req.file.mimetype) || !matchesFileSignature(req.file.buffer, req.file.mimetype)) {
    return res.status(415).json(unsupportedMediaType);
  }

  const label = String(req.body.label || "Document").trim();
  if (!label || label.length > 100) {
    return res.status(400).json({ message: "A document label of up to 100 characters is required" });
  }

  try {
    const scan = await scanDocument(req.file.buffer);
    if (scan.status === "infected") return res.status(422).json({ message: "Document was rejected by the virus scanner" });
    if (scan.status === "unavailable" && isVirusScanRequired()) {
      return res.status(503).json({ message: "Document scanning is temporarily unavailable" });
    }
  } catch (error) {
    req.log?.error({ err: error.message }, "Document virus scan failed");
    if (isVirusScanRequired()) return res.status(503).json({ message: "Document scanning is temporarily unavailable" });
  }

  if (!isCloudinaryConfigured()) {
    return res.status(503).json({ configured: false, message: "Document storage is not configured on this server" });
  }

  try {
    const { publicId, resourceType } = await uploadDocument(req.file.buffer, req.file.originalname, req.file.mimetype);
    const document = await DocumentUpload.create({
      ownerId: req.user.id,
      label,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      resourceType,
      publicId,
    });
    return res.status(201).json({ configured: true, uploadId: document._id, label: document.label });
  } catch (error) {
    req.log?.error({ err: error.message }, "Private document upload failed");
    return res.status(502).json({ configured: true, message: "Document upload failed" });
  }
});

// The signed Cloudinary URL is kept server-side. Only an authenticated officer
// can receive the document bytes, and only after it is attached to an application.
router.get("/document/:uploadId", authMiddleware, authorizeRole("officer"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.uploadId)) {
    return res.status(400).json({ message: "Invalid document ID" });
  }

  const document = await DocumentUpload.findOne({ _id: req.params.uploadId, applicationId: { $ne: null } });
  if (!document) return res.status(404).json({ message: "Document not found" });

  try {
    const response = await axios.get(getPrivateDocumentUrl(document), { responseType: "stream" });
    res.setHeader("Content-Type", document.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(document.originalName)}"`);
    response.data.pipe(res);
  } catch (error) {
    req.log?.error({ err: error.message, uploadId: document._id }, "Private document retrieval failed");
    return res.status(502).json({ message: "Document could not be retrieved" });
  }
});

export default router;
