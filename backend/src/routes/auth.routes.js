import express from "express";
import { beneficiaryLogin, officerLogin } from "../controllers/auth.controller.js";

const router = express.Router();

// Beneficiary login — mobile number only, no SMS/OTP step
router.post("/beneficiary-login", beneficiaryLogin);

// Officer / channel-partner login (role comes from the stored account)
router.post("/officer-login", officerLogin);

export default router;
