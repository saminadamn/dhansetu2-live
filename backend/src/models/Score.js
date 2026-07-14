import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    aadhaarHash: {
      type: String,
      required: true,
    },

    risk_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    repayment_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    income_proxy_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    risk_band: {
      type: String,
      default: "",
    },

    explanation: {
      type: mongoose.Schema.Types.Mixed, // feature importance mapping
      default: {},
    },
  },
  { timestamps: true }
);

// Index for fast lookups
scoreSchema.index({ aadhaarHash: 1 });

export const Score = mongoose.model("Score", scoreSchema);
