import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import API from "../../services/axiosInstance.js";
import { statusStyle, riskBandStyle } from "../../lib/riskBand.js";

export default function BeneficiaryDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [aadhaar, setAadhaar] = useState(localStorage.getItem("aadhaarNumber") || "");
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchApplications = async (aadhaarNumber) => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/beneficiary/applications/${aadhaarNumber}`);
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setError("Could not load your applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (aadhaar) fetchApplications(aadhaar);
  }, [aadhaar]);

  const handleLookup = (e) => {
    e.preventDefault();
    const cleaned = aadhaarInput.replace(/\D/g, "").slice(0, 12);
    if (cleaned.length !== 12) {
      setError("Enter a valid 12 digit Aadhaar number");
      return;
    }
    localStorage.setItem("aadhaarNumber", cleaned);
    setAadhaar(cleaned);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-govBlue dark:text-blue-300">My Applications</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track the status of every loan application you've submitted.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/application/new"
            className="px-4 py-2 rounded-lg bg-govBlue text-white text-sm font-semibold hover:bg-blue-800 transition"
          >
            + New Application
          </a>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {!aadhaar ? (
        <section className="section-box">
          <h2 className="section-title mb-4">Find your applications</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-prose">
            Login only verifies your mobile number, so enter the Aadhaar number you used on your
            loan application to view its status.
          </p>
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="text"
              maxLength={12}
              placeholder="12 digit Aadhaar number"
              value={aadhaarInput}
              onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, ""))}
              className="flex-1 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-govBlue"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-govBlue text-white text-sm font-semibold hover:bg-blue-800 transition"
            >
              View Applications
            </button>
          </form>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </section>
      ) : (
        <section className="section-box">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Application History</h2>
            <button
              onClick={() => {
                localStorage.removeItem("aadhaarNumber");
                setAadhaar("");
                setApplications([]);
              }}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-govBlue dark:hover:text-blue-300 transition"
            >
              Not you? Change Aadhaar
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading your applications…</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No applications found for this Aadhaar number yet.{" "}
              <a href="/application/new" className="text-govBlue dark:text-blue-300 font-medium">
                Apply for a loan
              </a>
              .
            </p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const band = app.scoresRef?.risk_band;
                return (
                  <button
                    key={app._id}
                    onClick={() => navigate(`/my-applications/${app._id}`, { state: { application: app } })}
                    className="w-full text-left card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:shadow-md hover:-translate-y-[1px] transition"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        Application ID: {app._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {app.applicantName} · {app.district || "—"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Submitted {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {band && (
                        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${riskBandStyle(band).badge}`}>
                          {band}
                        </span>
                      )}
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusStyle(app.status)}`}>
                        {app.status}
                      </span>
                      <span className="text-govBlue dark:text-blue-300 text-sm ml-1">→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
