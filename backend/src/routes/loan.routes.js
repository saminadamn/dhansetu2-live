import express from "express";
import { applyForLoan } from "../controllers/loan.controller.js";
import { getLoanHistory } from "../controllers/loan.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = express.Router();

// Apply for loan (beneficiary route)
router.post("/apply", authMiddleware, authorizeRole("beneficiary"), applyForLoan);

router.get("/history/:aadhaar", authMiddleware, authorizeRole("beneficiary"), getLoanHistory);


export default router;
