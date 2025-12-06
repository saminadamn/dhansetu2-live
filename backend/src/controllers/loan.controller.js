import LoanApplication from "../models/LoanApplication.js";
import FinancialProfile from "../models/FinancialProfile.js";
import { getMLPrediction } from "../services/ml.service.js";

export const applyForLoan = async (req, res) => {
  try {
    const {
      applicantName,
      aadhaarNumber,
      gender,
      occupation_type,
      education_level,
      household_size,
      ration_card_type,
      district
    } = req.body;

    // Fetch Financial history via Aadhaar
    const financialData = await FinancialProfile.findOne({ aadhaarNumber });

    if (!financialData) {
      return res.status(404).json({
        error: "Financial profile not found. Please add financial data first."
      });
    }

    // ML Payload (only features required by ML model)
    const mlPayload = {
      num_past_loans: financialData.num_past_loans,
      past_defaults: financialData.past_defaults,
      late_payments_count: financialData.late_payments_count,
      avg_days_past_due: financialData.avg_days_past_due,
      on_time_payment_ratio: financialData.on_time_payment_ratio,
      repayment_regular_for_last_6m: financialData.repayment_regular_for_last_6m,
      utilization_ratio: financialData.utilization_ratio,
      current_outstanding_balance: financialData.current_outstanding_balance,
      active_loans_count: financialData.active_loans_count,
      emi_bounce_count: financialData.emi_bounce_count,
      field_officer_repayment_rating: financialData.field_officer_repayment_rating,
      declared_monthly_income: financialData.declared_monthly_income,
      bank_avg_monthly_inflow: financialData.bank_avg_monthly_inflow,
      bank_balance_median: financialData.bank_balance_median,
      transaction_count_monthly: financialData.transaction_count_monthly,
      electricity_units: financialData.electricity_units,
      mobile_recharge_amount: financialData.mobile_recharge_amount,
      asset_owned_count: financialData.asset_owned_count,
      ration_card_type,
      household_size,
      occupation_type,
      education_level,
      district_poverty_index: financialData.district_poverty_index,
      income_to_loan_ratio: financialData.income_to_loan_ratio,
      monthly_obligation_ratio: financialData.monthly_obligation_ratio
    };

    // Call ML service

    const mlResult = await getMLPrediction(mlPayload);

      application.repayment_score = mlResult.repayment_score;
      application.income_proxy_score = mlResult.income_proxy_score;
      application.composite_score = mlResult.ccs;
      application.risk_band = mlResult.risk_band;


    // Save final loan application
    const application = await LoanApplication.create({
      applicantName,
      aadhaarNumber,
      gender,
      occupation_type,
      education_level,
      household_size,
      ration_card_type,
      district,
      repayment_score,
      income_proxy_score,
      composite_score,
      risk_band,
      status: "PENDING",
    });

    return res.status(201).json({
      message: "Loan application evaluated successfully",
      application
    });

  } catch (error) {
    console.error("❌ applyForLoan error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
