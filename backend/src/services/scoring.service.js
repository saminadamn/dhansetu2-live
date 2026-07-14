import LoanApplication from "../models/LoanApplication.js";
import { Score } from "../models/Score.js";

export function normalizeScore(value) {
  const sigmoid = 1 / (1 + Math.exp(-value / 10)); // smooth transformation
  return Math.round(sigmoid * 100); // convert to 0–100
}

// Shared by the synchronous fallback path (loan.controller.js, when no
// message broker is configured) and the decision worker (async pipeline)
// so both routes persist scores identically.
export async function persistScoreAndUpdateApplication({ applicationId, aadhaarHash, mlResult }) {
  const savedScore = await Score.create({
    aadhaarHash,
    risk_score: normalizeScore(mlResult.ccs),
    repayment_score: normalizeScore(mlResult.repayment_score),
    income_proxy_score: normalizeScore(mlResult.income_proxy_score),
    risk_band: mlResult.risk_band || "",
    explanation: mlResult.explanation || {},
  });

  const application = await LoanApplication.findByIdAndUpdate(
    applicationId,
    { scoresRef: savedScore._id },
    { new: true }
  );

  return { application, savedScore };
}
