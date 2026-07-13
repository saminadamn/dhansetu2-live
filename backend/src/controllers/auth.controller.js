import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ===============================
// Beneficiary Login (Mobile Number only — no SMS/OTP step)
// POST /api/auth/beneficiary-login
// ===============================
export const beneficiaryLogin = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({ message: "A valid 10 digit mobile number is required" });
    }

    let user = await User.findOne({ mobileNumber, role: "beneficiary" });
    if (!user) {
      user = await User.create({ mobileNumber, role: "beneficiary", isVerified: true });
    }

    const token = jwt.sign(
      { id: user._id, role: "beneficiary", mobileNumber: user.mobileNumber },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      role: "beneficiary",
    });

  } catch (error) {
    console.error("❌ beneficiaryLogin error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// Officer / Channel Partner Login (Employee ID + Password)
// POST /api/auth/officer-login
// Works for both roles — the account's own `role` field (set at creation)
// decides what the issued token is scoped to, not this endpoint.
// ===============================
export const officerLogin = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({ message: "Employee ID and password required" });
    }

    const officer = await User.findOne({ employeeId }).select("+passwordHash");
    if (!officer) {
      return res.status(404).json({ message: "Account not found" });
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
      message: "Login successful",
      token,
      officer: {
        id: officer._id,
        role: officer.role,
        employeeId: officer.employeeId,
      }
    });

  } catch (error) {
    console.error("❌ officerLogin error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
