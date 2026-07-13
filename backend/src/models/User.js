import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["beneficiary", "officer"],
      required: true,
      default: "beneficiary",
    },

    aadhaarNumber: { type: String, trim: true, unique: true, sparse: true },
    employeeId: { type: String, trim: true, unique: true, sparse: true },

    mobileNumber: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "beneficiary";
      },
    },

    passwordHash: {
      type: String,
      required: function () {
        return this.role === "officer";
      },
      select: false,
    },

    tempOtp: String,
    otpExpires: Date,
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.index({ aadhaarNumber: 1 });
userSchema.index({ employeeId: 1 });

export const User = mongoose.model("User", userSchema);
