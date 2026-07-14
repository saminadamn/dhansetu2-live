import express from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { isCloudinaryConfigured, uploadDocument } from "../services/cloudinary.service.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per document
});

router.use(authMiddleware, authorizeRole("beneficiary"));

// POST /api/uploads/document — multipart field "file". Returns the hosted
// Cloudinary URL, which the loan application form then includes in its
// submission payload. 503 (not an error state for the client) when
// Cloudinary credentials aren't configured on this server.
router.post("/document", upload.single("file"), async (req, res) => {
  if (!isCloudinaryConfigured()) {
    return res.status(503).json({
      configured: false,
      message: "Document storage (Cloudinary) is not configured on this server yet",
    });
  }

  if (!req.file) {
    return res.status(400).json({ message: "A file is required (multipart field: file)" });
  }

  try {
    const { url, publicId } = await uploadDocument(req.file.buffer, req.file.originalname);
    return res.status(201).json({ configured: true, url, publicId });
  } catch (error) {
    req.log?.error({ err: error.message }, "Cloudinary upload failed");
    return res.status(502).json({ configured: true, message: "Document upload failed" });
  }
});

export default router;
