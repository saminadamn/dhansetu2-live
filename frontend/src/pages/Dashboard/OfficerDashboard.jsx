// src/pages/Dashboard/OfficerDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/axiosInstance.js";
import { AuthContext } from "../../context/AuthContext.jsx";

export default function OfficerDashboard() {
  const [applications, setApplications] = useState([]);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      const res = await API.get("/officer/applications");
      setApplications(res.data.applications);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-govBlue">Officer Dashboard</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-md"
        >
          Logout
        </button>
      </header>

      <section className="bg-white border border-slate-300 shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Loan Applications</h2>

        {applications.length === 0 ? (
          <p>No applications submitted yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 text-left border-b">
                <th className="p-3">Applicant</th>
                <th className="p-3">Aadhaar</th>
                <th className="p-3">Composite Score</th>
                <th className="p-3">Risk Band</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((app) => (
                <tr key={app._id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{app.applicantName}</td>
                  <td className="p-3">**** **** {app.aadhaarNumber.slice(-4)}</td>
                  <td className="p-3">
                    {app.scoresRef?.risk_score || "N/A"}
                  </td>
                  <td className="p-3">
                    {app.scoresRef?.risk_band || "N/A"}
                  </td>
                  <td className="p-3 font-semibold">{app.status}</td>
                  <td className="p-3">
                    <button
                      onClick={() => navigate(`/applications/${app._id}`)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
