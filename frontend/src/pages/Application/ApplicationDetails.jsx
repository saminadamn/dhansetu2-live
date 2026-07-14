// src/pages/Dashboard/ApplicationDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/axiosInstance.js";
import ScoreCard from "../../components/ui/ScoreCard.jsx";
import ShapExplainability from "../../components/ui/ShapExplainability.jsx";
import { statusStyle, riskBandStyle } from "../../lib/riskBand.js";

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    API.get(`/officer/applications/${id}`)
      .then((res) => {
        if (isCurrent) setApplication(res.data.application);
      })
      .catch((err) => {
        if (isCurrent) console.error("Error fetching details:", err);
      });

    return () => {
      isCurrent = false;
    };
  }, [id]);

  const updateStatus = async (status) => {
    await API.patch(`/officer/applications/${id}/decision`, {
      status,
      officerRemarks: "Reviewed by officer"
    });
    navigate("/dashboard/officer");
  };

  const openDocument = async (uploadId) => {
    try {
      const response = await API.get(`/uploads/document/${uploadId}`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error("Unable to open document:", err);
    }
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
        <p><strong>Aadhaar:</strong> {application.aadhaarLast4 ? `****-****-${application.aadhaarLast4}` : "—"}</p>
        <p><strong>District:</strong> {application.district}</p>

        {application.documents?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="font-semibold text-sm mb-2">Submitted Documents</p>
            <ul className="space-y-1">
              {application.documents.map((doc, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => openDocument(doc.uploadId)}
                    className="text-sm text-govBlue dark:text-blue-300 hover:underline"
                  >
                    📎 {doc.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
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

          <div className="mt-6">
            <ShapExplainability explanation={scores.explanation} />
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
