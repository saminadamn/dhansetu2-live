import express from "express";
import { uploadCSV, getFinancialData } from "../controllers/channel.controller.js";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware, authorizeRole("channel"));

router.get("/financial-data", getFinancialData);
router.post("/upload-csv", upload.single("file"), uploadCSV);

export default router;
