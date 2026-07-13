import LoanApplication from "../models/LoanApplication.js";

export const getBeneficiaryApplications = async (req, res) => {
  try {
    const { aadhaar } = req.params;

    const applications = await LoanApplication.find({ aadhaarNumber: aadhaar })
      .populate("scoresRef");

    return res.status(200).json({
      message: "Applications fetched",
      applications
    });
  } catch (error) {
    console.error("❌ getBeneficiaryApplications error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
