// src/pages/Dashboard/OfficerDashboard.jsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/axiosInstance.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import { statusStyle, riskBandStyle } from "../../lib/riskBand.js";

const TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Denied" },
  { key: "REPEATED", label: "Repeated Users" },
];

const SORT_OPTIONS = [
  { key: "date_desc", label: "Newest First" },
  { key: "date_asc", label: "Oldest First" },
  { key: "score_desc", label: "Composite Score (High → Low)" },
  { key: "score_asc", label: "Composite Score (Low → High)" },
  { key: "income_desc", label: "Income Proxy (High → Low)" },
  { key: "income_asc", label: "Income Proxy (Low → High)" },
];

export default function OfficerDashboard() {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [sortBy, setSortBy] = useState("date_desc");
  const [applications, setApplications] = useState([]);
  const [repeatedUsers, setRepeatedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchApplications = async (status) => {
    setLoading(true);
    try {
      const res = await API.get("/officer/applications", { params: { status } });
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepeatedUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/officer/repeated-users");
      setRepeatedUsers(res.data.repeatedUsers || []);
    } catch (err) {
      console.error("Failed to fetch repeated users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "REPEATED") {
      fetchRepeatedUsers();
    } else {
      fetchApplications(activeTab);
    }
  }, [activeTab]);

  const sortedApplications = useMemo(() => {
    const list = [...applications];
    list.sort((a, b) => {
      switch (sortBy) {
        case "date_asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "score_desc":
          return (b.scoresRef?.risk_score ?? -1) - (a.scoresRef?.risk_score ?? -1);
        case "score_asc":
          return (a.scoresRef?.risk_score ?? -1) - (b.scoresRef?.risk_score ?? -1);
        case "income_desc":
          return (b.scoresRef?.income_proxy_score ?? -1) - (a.scoresRef?.income_proxy_score ?? -1);
        case "income_asc":
          return (a.scoresRef?.income_proxy_score ?? -1) - (b.scoresRef?.income_proxy_score ?? -1);
        case "date_desc":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    return list;
  }, [applications, sortBy]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold text-govBlue dark:text-blue-300">Officer Dashboard</h1>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          Logout
        </button>
      </header>

      {/* Queue tabs */}
      <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-sm font-medium py-2 px-4 rounded-lg transition-all ${
              activeTab === tab.key
                ? "bg-govBlue dark:bg-blue-600 text-white shadow"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="card p-4">
        {activeTab !== "REPEATED" ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold">{TABS.find((t) => t.key === activeTab)?.label} Applications</h2>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-govBlue"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
            ) : sortedApplications.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No applications in this queue.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-left border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3">Applicant</th>
                      <th className="p-3">Aadhaar</th>
                      <th className="p-3">Composite Score</th>
                      <th className="p-3">Risk Band</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedApplications.map((app) => {
                      const band = app.scoresRef?.risk_band;
                      return (
                        <tr key={app._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3">{app.applicantName}</td>
                          <td className="p-3 font-mono text-xs">**** **** {app.aadhaarNumber.slice(-4)}</td>
                          <td className="p-3">{app.scoresRef?.risk_score ?? "N/A"}</td>
                          <td className="p-3">
                            {band ? (
                              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${riskBandStyle(band).badge}`}>
                                {band}
                              </span>
                            ) : "N/A"}
                          </td>
                          <td className="p-3">
                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusStyle(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => navigate(`/applications/${app._id}`)}
                              className="px-3 py-1.5 bg-govBlue text-white rounded-lg text-xs font-medium hover:bg-blue-800 transition"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-1">Repeated Users — Score Improved</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Returning applicants whose Composite Credit Score has increased since their first application.
            </p>

            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
            ) : repeatedUsers.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No repeated applicants with an improved score yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-left border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3">Applicant</th>
                      <th className="p-3">Aadhaar</th>
                      <th className="p-3">Applications</th>
                      <th className="p-3">First Score</th>
                      <th className="p-3">Latest Score</th>
                      <th className="p-3">Improvement</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repeatedUsers.map((u) => (
                      <tr key={u.aadhaarNumber} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3">{u.applicantName}</td>
                        <td className="p-3 font-mono text-xs">**** **** {u.aadhaarNumber.slice(-4)}</td>
                        <td className="p-3">{u.applicationCount}</td>
                        <td className="p-3">{u.firstScore}</td>
                        <td className="p-3">{u.latestScore}</td>
                        <td className="p-3">
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800">
                            +{u.scoreImprovement.toFixed(1)}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => navigate(`/applications/${u.latestApplication._id}`)}
                            className="px-3 py-1.5 bg-govBlue text-white rounded-lg text-xs font-medium hover:bg-blue-800 transition"
                          >
                            View Latest
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
