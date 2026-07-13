import FinancialProfile from "../models/FinancialProfile.js";
import { hashAadhaar, aadhaarLast4 } from "../utils/hashAadhaar.js";

// POST /api/financial/add
export const addFinancialProfile = async (req, res) => {
  try {
    const {
      aadhaarNumber,
      num_past_loans,
      past_defaults,
      late_payments_count,
      avg_days_past_due,
      on_time_payment_ratio,
      repayment_regular_for_last_6m,
      utilization_ratio,
      current_outstanding_balance,
      active_loans_count,
      emi_bounce_count,
      field_officer_repayment_rating,
      declared_monthly_income,
      bank_avg_monthly_inflow,
      bank_balance_median,
      transaction_count_monthly,
      electricity_units,
      mobile_recharge_amount,
      asset_owned_count,
      district_poverty_index,
      income_to_loan_ratio,
      monthly_obligation_ratio
    } = req.body;

    if (!aadhaarNumber) {
      return res.status(400).json({ message: "Aadhaar number is required" });
    }

    const aadhaarHash = hashAadhaar(aadhaarNumber);

    const exists = await FinancialProfile.findOne({ aadhaarHash });
    if (exists) {
      return res.status(400).json({ message: "Profile already exists for this Aadhaar" });
    }

    const newProfile = await FinancialProfile.create({
      aadhaarHash,
      aadhaarLast4: aadhaarLast4(aadhaarNumber),
      num_past_loans,
      past_defaults,
      late_payments_count,
      avg_days_past_due,
      on_time_payment_ratio,
      repayment_regular_for_last_6m,
      utilization_ratio,
      current_outstanding_balance,
      active_loans_count,
      emi_bounce_count,
      field_officer_repayment_rating,
      declared_monthly_income,
      bank_avg_monthly_inflow,
      bank_balance_median,
      transaction_count_monthly,
      electricity_units,
      mobile_recharge_amount,
      asset_owned_count,
      district_poverty_index,
      income_to_loan_ratio,
      monthly_obligation_ratio
    });

    return res.status(201).json({
      message: "Financial data saved successfully",
      data: newProfile
    });

  } catch (err) {
    console.error("❌ addFinancialProfile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /api/financial/:aadhaar
export const getFinancialProfile = async (req, res) => {
  try {
    const { aadhaar } = req.params;

    const profile = await FinancialProfile.findOne({ aadhaarHash: hashAadhaar(aadhaar) });
    if (!profile) {
      return res.status(404).json({ message: "No financial profile found for this Aadhaar" });
    }

    return res.json(profile);

  } catch (err) {
    console.error("❌ getFinancialProfile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
