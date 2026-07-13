import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOTP, sendOTPViaFast2SMS } from "../services/otp.service.js";

// ===============================
// Beneficiary: Request OTP
// POST /api/auth/send-otp
// ===============================
export const sendOTP = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ message: "Mobile number required" });
    }

    let user = await User.findOne({ mobileNumber });

    // Create beneficiary if not exist
    if (!user) {
      user = await User.create({ mobileNumber, role: "beneficiary" });
    }

    // No Fast2SMS account yet — use a fixed test OTP instead of sending a real SMS.
    // Once FAST2SMS_API_KEY is set to a working key, this automatically switches to real SMS.
    const hasSmsProvider = Boolean(process.env.FAST2SMS_API_KEY);
    const otp = hasSmsProvider ? generateOTP() : "123456";

    user.tempOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 min expiry
    await user.save();

    if (hasSmsProvider) {
      await sendOTPViaFast2SMS(mobileNumber, otp);
    } else {
      console.log(`📩 [TEST MODE] OTP for ${mobileNumber}: ${otp}`);
    }

    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("❌ sendOTP error:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ===============================
// Beneficiary: Verify OTP
// POST /api/auth/verify-otp
// ===============================
export const verifyOTP = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
      return res.status(400).json({ message: "Mobile number and OTP required" });
    }

    const user = await User.findOne({ mobileNumber });

    if (!user || !user.tempOtp || user.tempOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "OTP expired, request a new one" });
    }

    user.tempOtp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: "beneficiary", mobileNumber: user.mobileNumber },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "OTP verified successfully",
      token,
      role: "beneficiary"
    });

  } catch (error) {
    console.error("❌ verifyOTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};







// ===============================
// Officer Login (Employee ID + Password)
// POST /api/auth/officer-login
// ===============================
export const officerLogin = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({ message: "Employee ID and password required" });
    }

    const officer = await User.findOne({ employeeId }).select("+passwordHash");
    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }

    const match = await bcrypt.compare(password, officer.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: officer._id, role: officer.role, employeeId: officer.employeeId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Officer login successful",
      token,
      officer
    });

  } catch (error) {
    console.error("❌ officerLogin error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
