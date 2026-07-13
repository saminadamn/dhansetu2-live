import FinancialProfile from "../models/FinancialProfile.js";
import csv from "csv-parser";
import { Readable } from "stream";
import { hashAadhaar, aadhaarLast4 } from "../utils/hashAadhaar.js";

export const getFinancialData = async (req, res) => {
  try {
    const profiles = await FinancialProfile.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    console.error("❌ getFinancialData Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    console.log("File received:", req.file.originalname);

    const results = [];
    const stream = Readable.from(req.file.buffer);

    stream
      .pipe(csv())
      .on("data", (row) => {
        const rawAadhaar = row.aadhaarNumber || row.aadhaar || row.AADHAAR;
        if (!rawAadhaar) return; // skip rows with no Aadhaar to hash

        results.push({
          aadhaarHash: hashAadhaar(rawAadhaar),
          aadhaarLast4: aadhaarLast4(rawAadhaar),

          num_past_loans: Number(row.num_past_loans),
          past_defaults: Number(row.past_defaults),
          late_payments_count: Number(row.late_payments_count),
          avg_days_past_due: Number(row.avg_days_past_due),
          on_time_payment_ratio: Number(row.on_time_payment_ratio),
          repayment_regular_for_last_6m: Number(row.repayment_regular_for_last_6m),
          utilization_ratio: Number(row.utilization_ratio),
          current_outstanding_balance: Number(row.current_outstanding_balance),
          active_loans_count: Number(row.active_loans_count),
          emi_bounce_count: Number(row.emi_bounce_count),
          field_officer_repayment_rating: Number(row.field_officer_repayment_rating),
          declared_monthly_income: Number(row.declared_monthly_income),
          bank_avg_monthly_inflow: Number(row.bank_avg_monthly_inflow),
          bank_balance_median: Number(row.bank_balance_median),
          transaction_count_monthly: Number(row.transaction_count_monthly),
          electricity_units: Number(row.electricity_units),
          mobile_recharge_amount: Number(row.mobile_recharge_amount),
          asset_owned_count: Number(row.asset_owned_count),
          district_poverty_index: Number(row.district_poverty_index),
          income_to_loan_ratio: Number(row.income_to_loan_ratio),
          monthly_obligation_ratio: Number(row.monthly_obligation_ratio),
        });
      })
      .on("end", async () => {
        try {
          const inserted = await FinancialProfile.insertMany(results, { ordered: false });
          console.log("Inserted rows:", inserted.length);

          res.status(200).json({
            message: "CSV imported successfully",
            inserted: inserted.length
          });
        } catch (err) {
          console.error("Insert Failure:", err);
          res.status(500).json({ message: "Failed to import CSV rows" });
        }
      });

  } catch (error) {
    console.error("CSV Upload Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
