import express from "express";
import { sendOTP, verifyOTP, officerLogin } from "../controllers/auth.controller.js";

const router = express.Router();

// Beneficiary Aadhaar OTP login
// backend/routes/auth.routes.js
router.post("/send-otp", sendOTP);        // expects mobileNumber
router.post("/verify-otp", verifyOTP);    // expects mobileNumber + otp


// Officer login
router.post("/officer-login", officerLogin);

export default router;
