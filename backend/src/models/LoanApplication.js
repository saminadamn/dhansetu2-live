import mongoose from "mongoose";

const LoanApplicationSchema = new mongoose.Schema(
  {
    applicantName: { type: String, required: true },
    // The raw Aadhaar number is never stored — only its SHA-256 hash (used
    // as the lookup/join key) and last 4 digits (for masked display).
    aadhaarHash: { type: String, required: true, index: true },
    aadhaarLast4: { type: String, required: true },
    gender: { type: String },
    category: { type: String, default: "OBC" },

    // Socio-economic
    occupation_type: { type: String },
    education_level: { type: String },
    household_size: { type: Number },
    ration_card_type: { type: String },
    district: { type: String },

    // Reference to Financial Data
    financialDataRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialProfile",
      default: null,
    },

    // Reference to ML Score record
    scoresRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Score",
      default: null,
    },

    // References to verified, private uploads. URLs are never persisted.
    documents: [
      {
        label: { type: String },
        uploadId: { type: mongoose.Schema.Types.ObjectId, ref: "DocumentUpload" },
      },
    ],

    // Status for officer workflow
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CLARIFICATION"],
      default: "PENDING",
    },



    officerRemarks: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("LoanApplication", LoanApplicationSchema);
