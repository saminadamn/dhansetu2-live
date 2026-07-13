import LoanApplication from "../models/LoanApplication.js";
import FinancialProfile from "../models/FinancialProfile.js";
import { Score } from "../models/Score.js";
import { getMLPrediction } from "../services/ml.service.js";
import { hashAadhaar, aadhaarLast4 } from "../utils/hashAadhaar.js";



function normalizeScore(value) {
  const sigmoid = 1 / (1 + Math.exp(-value / 10));  // smooth transformation
  return Math.round(sigmoid * 100);                 // convert to 0–100
}

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


    //documnet

    const aadhaarHash = hashAadhaar(aadhaarNumber);

    // Try to fetch Financial history
    let financialData = await FinancialProfile.findOne({ aadhaarHash });

    // Step 1: Build ML Payload dynamically
    const mlPayload = {
      ration_card_type,
      household_size,
      occupation_type,
      education_level,
      district,

      // If profile exists, include advanced data, otherwise fallback to null
      num_past_loans: financialData?.num_past_loans ?? 0,
      past_defaults: financialData?.past_defaults ?? 0,
      late_payments_count: financialData?.late_payments_count ?? 0,
      avg_days_past_due: financialData?.avg_days_past_due ?? 0,
      on_time_payment_ratio: financialData?.on_time_payment_ratio ?? 0,
      repayment_regular_for_last_6m: financialData?.repayment_regular_for_last_6m ?? 0,
      utilization_ratio: financialData?.utilization_ratio ?? 0,
      current_outstanding_balance: financialData?.current_outstanding_balance ?? 0,
      active_loans_count: financialData?.active_loans_count ?? 0,
      emi_bounce_count: financialData?.emi_bounce_count ?? 0,
      field_officer_repayment_rating: financialData?.field_officer_repayment_rating ?? 0,
      declared_monthly_income: financialData?.declared_monthly_income ?? null,
      bank_avg_monthly_inflow: financialData?.bank_avg_monthly_inflow ?? null,
      bank_balance_median: financialData?.bank_balance_median ?? null,
      transaction_count_monthly: financialData?.transaction_count_monthly ?? null,
      electricity_units: financialData?.electricity_units ?? null,
      mobile_recharge_amount: financialData?.mobile_recharge_amount ?? null,
      asset_owned_count: financialData?.asset_owned_count ?? null,
      district_poverty_index: financialData?.district_poverty_index ?? null,
      income_to_loan_ratio: financialData?.income_to_loan_ratio ?? null,
      monthly_obligation_ratio: financialData?.monthly_obligation_ratio ?? null
    };

    // Step 2: Call ML Service
    const mlResult = await getMLPrediction(mlPayload);

    // Step 3: Save ML Scores
    const savedScore = await Score.create({
      aadhaarHash,
      risk_score:normalizeScore( mlResult.ccs),
      repayment_score: normalizeScore(mlResult.repayment_score),
      income_proxy_score: normalizeScore(mlResult.income_proxy_score),
      explanation: mlResult.explanation || {}
    });

    // Step 4: Save loan application
    const application = await LoanApplication.create({
      applicantName,
      aadhaarHash,
      aadhaarLast4: aadhaarLast4(aadhaarNumber),
      gender,
      occupation_type,
      education_level,
      household_size,
      ration_card_type,
      district,
      financialDataRef: financialData?._id || null,
      scoresRef: savedScore._id,
      status: "PENDING"
    });

  return res.status(201).json({
  message: "Loan application processed successfully",
  application,
  scores: savedScore,
  risk_score: savedScore.risk_score,
  repayment_score: savedScore.repayment_score,
  income_proxy_score: savedScore.income_proxy_score,
  risk_band: mlResult.risk_band
});



  } catch (error) {
    console.error("❌ applyForLoan error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};





//LOAN HISTORY CONTROLLER

// GET Loan history by Aadhaar
export const getLoanHistory = async (req, res) => {
  try {
    const { aadhaar } = req.params;

    if (!aadhaar) {
      return res.status(400).json({ message: "Aadhaar number is required" });
    }

    // Fetch all loan applications for this user in sorted order (latest first)
    const applications = await LoanApplication.find({ aadhaarHash: hashAadhaar(aadhaar) })
      .populate("scoresRef")
      .populate("financialDataRef")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Loan history fetched successfully",
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error("❌ getLoanHistory Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
