import { Router } from "express";
import { applyForLoan } from "../controllers/loan.controller.js";

const router = Router();

router.post("/apply", applyForLoan);

// add quick test route
router.get("/", (req, res) => {
  res.json({ message: "Loans API working 🟢" });
});


import { getMLPrediction } from "../services/ml.service.js";

router.get("/integration-test", async (req, res) => {
  try {
    const payload = {
      declared_monthly_income: 12000,
      occupation_type: "Daily Wage",
      education_level: "Primary",
      ration_card_type: "BPL"
    };

    const result = await getMLPrediction(payload);

    return res.json({
      message: "ML connected successfully 🎉",
      result
    });
  } catch (err) {
    console.error("Integration test error:", err.message);
    return res.status(500).json({ error: "ML test failed", detail: err.message });
  }
});



export default router;
