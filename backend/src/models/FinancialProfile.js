import mongoose from "mongoose";

const financialProfileSchema = new mongoose.Schema(
  {
    aadhaarNumber: { type: String, required: true, unique: true },

    // Loan history & repayment features
    num_past_loans: Number,
    past_defaults: Number,
    late_payments_count: Number,
    avg_days_past_due: Number,
    on_time_payment_ratio: Number,
    repayment_regular_for_last_6m: Number,
    utilization_ratio: Number,
    current_outstanding_balance: Number,
    active_loans_count: Number,
    emi_bounce_count: Number,
    field_officer_repayment_rating: Number,

    // Income / utility signals
    declared_monthly_income: Number,
    bank_avg_monthly_inflow: Number,
    bank_balance_median: Number,
    transaction_count_monthly: Number,
    electricity_units: Number,
    mobile_recharge_amount: Number,
    asset_owned_count: Number,
    district_poverty_index: Number,
    income_to_loan_ratio: Number,
    monthly_obligation_ratio: Number
  },
  { timestamps: true }
);

export default mongoose.model("FinancialProfile", financialProfileSchema);
