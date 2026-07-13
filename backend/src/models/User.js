import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["beneficiary", "officer", "channel"],
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
        return this.role === "officer" || this.role === "channel";
      },
      select: false,
    },

    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// No explicit .index() calls needed — `unique: true` above already
// creates indexes for aadhaarNumber and employeeId.

export const User = mongoose.model("User", userSchema);
