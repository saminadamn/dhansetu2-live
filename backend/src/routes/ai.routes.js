import express from "express";
import fileUpload from "express-fileupload";
import { extractTextFromImage, convertSpeechToText } from "../controllers/ai.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, abortOnLimit: true }));
router.use(authMiddleware);

router.post("/ocr", extractTextFromImage);
router.post("/speech", convertSpeechToText);

export default router;
