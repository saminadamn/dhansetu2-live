import express from "express";
import { uploadCSV, getFinancialData } from "../controllers/channel.controller.js";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// No dedicated channel-partner login exists yet; gated behind officer auth for now.
router.use(authMiddleware, authorizeRole("officer"));

router.get("/financial-data", getFinancialData);
router.post("/upload-csv", upload.single("file"), uploadCSV);

export default router;
