import mongoose from "mongoose";

const LoanApplicationSchema = new mongoose.Schema(
  {
    applicantName: { type: String, required: true },
    aadhaarNumber: { type: String, required: true },
    gender: { type: String },
    category: { type: String, default: "OBC" },

    // Socio-economic
    occupation_type: { type: String },
    education_level: { type: String },
    household_size: { type: Number },
    ration_card_type: { type: String },

    // Income / bank
    declared_monthly_income: { type: Number },
    bank_avg_monthly_inflow: { type: Number },
    bank_balance_median: { type: Number },
    transaction_count_monthly: { type: Number },
    electricity_units: { type: Number },
    mobile_recharge_amount: { type: Number },
    asset_owned_count: { type: Number },
    district_poverty_index: { type: Number },

    // Loan history
    num_past_loans: { type: Number },
    past_defaults: { type: Number },
    late_payments_count: { type: Number },
    avg_days_past_due: { type: Number },
    on_time_payment_ratio: { type: Number },
    repayment_regular_for_last_6m: { type: Number },
    utilization_ratio: { type: Number },
    current_outstanding_balance: { type: Number },
    active_loans_count: { type: Number },
    emi_bounce_count: { type: Number },
    field_officer_repayment_rating: { type: Number },
    income_to_loan_ratio: { type: Number },
    monthly_obligation_ratio: { type: Number },

    // ML output
    repayment_score: { type: Number },
    income_proxy_score: { type: Number },
    composite_score: { type: Number },
    risk_band: { type: String },

    // Status for officer
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    officerRemarks: { type: String },
  },
  { timestamps: true }
);

const LoanApplication = mongoose.model("LoanApplication", LoanApplicationSchema);

export default LoanApplication;
