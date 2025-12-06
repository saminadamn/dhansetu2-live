import axios from "axios";

export const getMLPrediction = async (payload) => {
  try {
    const res = await axios.post(process.env.ML_API_URL, payload);
    return res.data; // { repayment_score, income_score, ccs, risk_band }
  } catch (err) {
    console.error("❌ Error calling ML API:", err.message);
    throw new Error("ML service failed");
  }
};


