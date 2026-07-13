// src/pages/Dashboard/ApplicationDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/axiosInstance.js";

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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-govBlue">
        Application Details
      </h1>

      <div className="bg-white rounded-lg shadow p-4 border">
        <h2 className="text-xl font-semibold mb-3">Applicant Information</h2>
        <p><strong>Name:</strong> {application.applicantName}</p>
        <p><strong>Aadhaar:</strong> {application.aadhaarNumber}</p>
        <p><strong>District:</strong> {application.district}</p>
        <p><strong>Status:</strong> {application.status}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border">
        <h2 className="text-xl font-semibold mb-3">Score Insights</h2>
        {application.scoresRef ? (
          <>
            <p><strong>Repayment Score:</strong> {application.scoresRef.repayment_score}</p>
            <p><strong>Income Proxy Score:</strong> {application.scoresRef.income_proxy_score}</p>
            <p><strong>Composite Score:</strong> {application.scoresRef.risk_score}</p>
            <p><strong>Risk Band:</strong> {application.scoresRef.risk_band}</p>
          </>
        ) : (
          <p>No score available</p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => updateStatus("APPROVED")}
          className="px-5 py-2 bg-green-600 text-white rounded"
        >
          Approve
        </button>
        <button
          onClick={() => updateStatus("REJECTED")}
          className="px-5 py-2 bg-red-600 text-white rounded"
        >
          Reject
        </button>
        <button
          onClick={() => updateStatus("CLARIFICATION")}
          className="px-5 py-2 bg-yellow-600 text-white rounded"
        >
          Ask Clarification
        </button>
      </div>
    </div>
  );
}
