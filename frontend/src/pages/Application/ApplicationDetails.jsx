// src/pages/Dashboard/ApplicationDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/axiosInstance.js";
import ScoreCard from "../../components/ui/ScoreCard.jsx";
import { statusStyle, riskBandStyle } from "../../lib/riskBand.js";

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);

  const fetchDetails = async () => {
    try {
      const res = await API.get(`/officer/applications/${id}`);
      setApplication(res.data.application);
    } catch (err) {
      console.error("Error fetching details:", err);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const updateStatus = async (status) => {
    await API.patch(`/officer/applications/${id}/decision`, {
      status,
      officerRemarks: "Reviewed by officer"
    });
    navigate("/dashboard/officer");
  };

  if (!application) return <p className="p-6">Loading...</p>;

  const scores = application.scoresRef;
  const band = scores?.risk_band;
  const bandStyle = riskBandStyle(band);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-govBlue dark:text-blue-300">
          Application Details
        </h1>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${statusStyle(application.status)}`}>
          {application.status}
        </span>
      </div>

      <div className="card p-4">
        <h2 className="text-xl font-semibold mb-3">Applicant Information</h2>
        <p><strong>Name:</strong> {application.applicantName}</p>
        <p><strong>Aadhaar:</strong> {application.aadhaarNumber}</p>
        <p><strong>District:</strong> {application.district}</p>
      </div>

      {scores ? (
        <div className="card p-4">
          <h2 className="text-xl font-semibold mb-3">Credit Assessment</h2>

          <ScoreCard
            score={scores.risk_score}
            title="Composite Credit Score"
            subtitle="Weighted combination of repayment behaviour and income proxy scores."
            bandLabel={band}
          />

          {band && (
            <div className={`mt-4 rounded-lg border p-3 text-sm font-medium ${bandStyle.badge}`}>
              {band}: {bandStyle.note}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="card p-4 space-y-1">
              <p className="font-semibold text-govBlue dark:text-blue-300 text-sm">Repayment Score</p>
              <p className="text-sm">{scores.repayment_score} / 100</p>
            </div>
            <div className="card p-4 space-y-1">
              <p className="font-semibold text-govBlue dark:text-blue-300 text-sm">Income Proxy Score</p>
              <p className="text-sm">{scores.income_proxy_score} / 100</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">No score available for this application.</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => updateStatus("APPROVED")}
          className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          Approve
        </button>
        <button
          onClick={() => updateStatus("REJECTED")}
          className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
        >
          Reject
        </button>
        <button
          onClick={() => updateStatus("CLARIFICATION")}
          className="px-5 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition"
        >
          Ask Clarification
        </button>
      </div>
    </div>
  );
}
