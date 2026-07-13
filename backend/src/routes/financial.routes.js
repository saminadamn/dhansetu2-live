import express from "express";
import { addFinancialProfile, getFinancialProfile } from "../controllers/financial.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = express.Router();

// Add synthetic financial profile for a beneficiary (officer/back-office only)
router.post("/add", authMiddleware, authorizeRole("officer"), addFinancialProfile);

// Fetch profile by Aadhaar (officer/back-office only)
router.get("/:aadhaar", authMiddleware, authorizeRole("officer"), getFinancialProfile);

export default router;
