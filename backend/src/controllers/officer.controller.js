import LoanApplication from "../models/LoanApplication.js";
import FinancialProfile from "../models/FinancialProfile.js";
import { Score } from "../models/Score.js";

// ===============================
// GET ALL APPLICATIONS FOR OFFICER
// ===============================
// GET /api/officer/applications?status=PENDING
export const getAllApplications = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = status ? { status } : {};

    const applications = await LoanApplication.find(filter)
      .populate("financialDataRef")
      .populate("scoresRef")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Applications fetched successfully",
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error("❌ getAllApplications error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ======================================================
// GET REPEATED APPLICANTS WHOSE SCORE HAS IMPROVED
// ======================================================
// GET /api/officer/repeated-users
export const getRepeatedUsers = async (req, res) => {
  try {
    const applications = await LoanApplication.find({ scoresRef: { $ne: null } })
      .populate("scoresRef")
      .sort({ createdAt: 1 }); // oldest first, so we can compare first vs latest score

    const byAadhaar = {};
    for (const app of applications) {
      if (!byAadhaar[app.aadhaarHash]) byAadhaar[app.aadhaarHash] = [];
      byAadhaar[app.aadhaarHash].push(app);
    }

    const repeatedUsers = [];
    for (const apps of Object.values(byAadhaar)) {
      if (apps.length < 2) continue;

      const first = apps[0];
      const latest = apps[apps.length - 1];
      const firstScore = first.scoresRef?.risk_score;
      const latestScore = latest.scoresRef?.risk_score;

      if (firstScore == null || latestScore == null || latestScore <= firstScore) continue;

      repeatedUsers.push({
        aadhaarLast4: latest.aadhaarLast4,
        applicantName: latest.applicantName,
        applicationCount: apps.length,
        firstScore,
        latestScore,
        scoreImprovement: latestScore - firstScore,
        latestApplication: latest,
      });
    }

    repeatedUsers.sort((a, b) => b.scoreImprovement - a.scoreImprovement);

    return res.status(200).json({
      message: "Repeated users fetched successfully",
      count: repeatedUsers.length,
      repeatedUsers,
    });

  } catch (error) {
    console.error("❌ getRepeatedUsers error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ========================================
// GET APPLICATION DETAILS BY ID FOR OFFICER
// ========================================
// GET /api/officer/applications/:id
export const getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await LoanApplication.findById(id)
      .populate("financialDataRef")
      .populate("scoresRef");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.status(200).json({
      message: "Application details fetched",
      application
    });

  } catch (error) {
    console.error("❌ getApplicationDetails error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ======================================================
// UPDATE APPLICATION DECISION BY OFFICER (APPROVE/REJECT)
// ======================================================
// PATCH /api/officer/applications/:id/decision
export const updateApplicationDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, officerRemarks } = req.body;

    if (!["APPROVED", "REJECTED", "CLARIFICATION"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await LoanApplication.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    application.officerRemarks = officerRemarks || "";
    await application.save();

    return res.status(200).json({
      message: `Application ${status.toLowerCase()} successfully`,
      application
    });

  } catch (error) {
    console.error("❌ updateApplicationDecision error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
