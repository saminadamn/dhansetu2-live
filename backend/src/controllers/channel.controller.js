// import FinancialProfile from "../models/FinancialProfile.js";
import XLSX from "xlsx";

// export const uploadFinancialCSV = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//     const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const jsonData = XLSX.utils.sheet_to_json(sheet);

//     // Insert into MongoDB
//     await FinancialProfile.insertMany(jsonData, { ordered: false });

//     return res.status(201).json({
//       message: "Financial profiles uploaded successfully",
//       count: jsonData.length,
//     });
//   } catch (error) {
//     console.error("CSV Upload Error:", error);
//     res.status(500).json({ message: "Failed to upload file" });
//   }
// };

// export const getAllFinancialProfiles = async (req, res) => {
//   try {
//     const data = await FinancialProfile.find().sort({ createdAt: -1 });
//     return res.status(200).json({ message: "Profiles fetched", data });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch records" });
//   }
// };
import FinancialProfile from "../models/FinancialProfile.js";

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

import csv from "csv-parser";
import { Readable } from "stream";

export const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    console.log("File received:", req.file.originalname);

    const results = [];

    // Convert buffer to stream
    const stream = Readable.from(req.file.buffer);

    stream
      .pipe(csv())
      .on("data", (row) => {
        results.push({
          aadhaarNumber: row.aadhaarNumber || row.aadhaar || row.AADHAAR,

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
const result = await FinancialProfile.insertMany(results, {
  ordered: false
});

console.log("Inserted Count:", result.length);


        res.status(200).json({
          message: "CSV imported successfully",
          count: results.length
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
  }
});


  } catch (error) {
    console.error("CSV Upload Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
