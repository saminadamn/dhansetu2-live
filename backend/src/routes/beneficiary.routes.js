import express from "express";
import { getBeneficiaryApplications } from "../controllers/beneficiary.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = express.Router();
router.get("/applications/:aadhaar", authMiddleware, authorizeRole("beneficiary"), getBeneficiaryApplications);

export default router;
