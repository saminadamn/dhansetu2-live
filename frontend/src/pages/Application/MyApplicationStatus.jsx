import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import API from "../../services/axiosInstance.js";
import ScoreCard from "../../components/ui/ScoreCard.jsx";
import { statusStyle, riskBandStyle } from "../../lib/riskBand.js";

export default function MyApplicationStatus() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [application, setApplication] = useState(location.state?.application || null);
  const [loading, setLoading] = useState(!location.state?.application);
  const [error, setError] = useState("");

  useEffect(() => {
    if (application) return;

    // Direct link / refresh — no state passed. Refetch by the stored
    // Aadhaar and find this application in the list.
    const aadhaar = localStorage.getItem("aadhaarNumber");
    if (!aadhaar) {
      setError("We couldn't identify your application. Please open it from My Applications.");
      setLoading(false);
      return;
    }

    API.get(`/beneficiary/applications/${aadhaar}`)
      .then((res) => {
        const match = (res.data.applications || []).find((a) => a._id === id);
        if (match) setApplication(match);
        else setError("Application not found.");
      })
      .catch(() => setError("Failed to load application details."))
      .finally(() => setLoading(false));
  }, [application, id]);

  if (loading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading application status…</p>;
  }

  if (error || !application) {
    return (
      <div className="section-box">
        <p className="text-red-600 text-sm">{error || "Application not found."}</p>
        <a href="/dashboard/beneficiary" className="text-govBlue dark:text-blue-300 text-sm font-medium mt-3 inline-block">
          ← Back to My Applications
        </a>
      </div>
    );
  }

  const scores = application.scoresRef;
  const band = scores?.risk_band;
  const bandStyle = riskBandStyle(band);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/dashboard/beneficiary")}
        className="text-sm text-slate-500 dark:text-slate-400 hover:text-govBlue dark:hover:text-blue-300 transition"
      >
        ← Back to My Applications
      </button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-govBlue dark:text-blue-300">
            Application Status
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
            Application ID: {application._id.slice(-8).toUpperCase()}
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${statusStyle(application.status)}`}>
          {application.status}
        </span>
      </div>

      <section className="section-box">
        <h2 className="section-title mb-4">Applicant Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <p><span className="font-medium">Name:</span> {application.applicantName}</p>
          <p><span className="font-medium">District:</span> {application.district || "—"}</p>
          <p><span className="font-medium">Occupation:</span> {application.occupation_type || "—"}</p>
          <p><span className="font-medium">Ration Card:</span> {application.ration_card_type || "—"}</p>
          <p>
            <span className="font-medium">Aadhaar:</span>{" "}
            {application.aadhaarNumber ? `****-****-${application.aadhaarNumber.slice(-4)}` : "—"}
          </p>
          <p>
            <span className="font-medium">Submitted:</span>{" "}
            {new Date(application.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </section>

      {scores ? (
        <section className="section-box">
          <h2 className="section-title mb-4">Credit Assessment</h2>

          <ScoreCard
            score={scores.risk_score}
            title="Composite Credit Score"
            subtitle="Weighted combination of your repayment behaviour and income proxy scores."
            bandLabel={band}
          />

          <div className={`mt-4 rounded-lg border p-3 text-sm font-medium ${bandStyle.badge}`}>
            {band}: {bandStyle.note}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="card p-4 space-y-1">
              <p className="font-semibold text-govBlue dark:text-blue-300 text-sm">Repayment Score</p>
              <p className="text-sm">{scores.repayment_score} / 100</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Based on past loan performance, delays and EMI history.
              </p>
            </div>
            <div className="card p-4 space-y-1">
              <p className="font-semibold text-govBlue dark:text-blue-300 text-sm">Income Proxy Score</p>
              <p className="text-sm">{scores.income_proxy_score} / 100</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estimated from utility consumption and declared income signals.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="section-box">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your credit assessment is still being processed. Check back shortly.
          </p>
        </section>
      )}

      {application.officerRemarks && (
        <section className="section-box">
          <h2 className="section-title mb-3">Officer Remarks</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">{application.officerRemarks}</p>
        </section>
      )}
    </div>
  );
}
