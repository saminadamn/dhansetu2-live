// // src/pages/Dashboard/BeneficiaryDashboard.jsx
// import React, { useEffect, useState, useContext } from "react";
// import { AuthContext } from "../../context/AuthContext.jsx";
// import API from "../../services/axiosInstance.js";

// export default function BeneficiaryDashboard() {
//   const { user, logout } = useContext(AuthContext);
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!user?.aadhaarNumber) return;

//     const fetchApplications = async () => {
//       try {
//         const res = await API.get(`/loans/history/${user.aadhaarNumber}`);
//         setApplications(res.data.applications);
//       } catch (error) {
//         console.error("Failed to load applications:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchApplications();
//   }, [user]);

//   return (
//     <div className="p-6 space-y-6">
//       <header className="flex justify-between items-center">
//         <h1 className="text-2xl font-semibold text-govBlue">
//           Beneficiary Dashboard
//         </h1>
//         <button
//           onClick={logout}
//           className="px-4 py-2 bg-red-600 text-white rounded-md"
//         >
//           Logout
//         </button>
//       </header>

//       <section className="bg-white shadow rounded-lg p-4 border">
//         <h2 className="text-xl font-semibold mb-3">Your Profile</h2>
//         <p><strong>Aadhaar:</strong> ****-****-{user?.aadhaarNumber?.slice(-4)}</p>
//       </section>

//       <section className="bg-white shadow rounded-lg p-4 border">
//         <h2 className="text-xl font-semibold mb-3">Loan Applications</h2>

//         {loading ? (
//           <p>Loading...</p>
//         ) : !applications.length ? (
//           <p>No loan applications found.</p>
//         ) : (
//           applications.map((app) => (
//             <div
//               key={app._id}
//               className="p-3 border rounded flex justify-between mb-3"
//             >
//               <div>
//                 <p><strong>Status:</strong> {app.status}</p>
//                 {app.scoresRef && (
//                   <>
//                     <p><strong>Repayment Score:</strong> {app.scoresRef.repayment_score}</p>
//                     <p><strong>Risk Score:</strong> {app.scoresRef.risk_score}</p>
//                     <p><strong>Income Score:</strong> {app.scoresRef.income_proxy_score}</p>
//                   </>
//                 )}
//               </div>
//             </div>
//           ))
//         )}
//       </section>
//     </div>
//   );
// }

//new ocde
// src/pages/Dashboard/BeneficiaryDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import API from "../../services/axiosInstance.js";

export default function BeneficiaryDashboard() {
  const { user, logout } = useContext(AuthContext);

  const [applications, setApplications] = useState([]);
  const [latestScores, setLatestScores] = useState(
    JSON.parse(localStorage.getItem("latestLoanScores"))
  );

  const fetchApplications = async () => {
    try {
      const res = await API.get(`/beneficiary/applications/${user?.aadhaarNumber}`);
      setApplications(res.data.applications);
    } catch (error) {
      console.error("Failed to load applications:", error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-govBlue">Beneficiary Dashboard</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-md"
        >
          Logout
        </button>
      </header>

      {/* SHOW MOST RECENT SCORES */}
      {latestScores && (
        <section className="bg-blue-50 border border-blue-300 rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-3 text-blue-700">
            Recent Loan Application Score
          </h2>

          <p><strong>Risk Score:</strong> {latestScores.risk_score}</p>
          <p><strong>Repayment Score:</strong> {latestScores.repayment_score}</p>
          <p><strong>Income Score:</strong> {latestScores.income_proxy_score}</p>
          <p><strong>Risk Band:</strong> {latestScores.risk_band}</p>
        </section>
      )}

      {/* LOAN HISTORY SECTION */}
      <section className="bg-white shadow rounded-lg p-4 border">
        <h2 className="text-xl font-semibold mb-3">Loan Applications</h2>

        {!applications.length ? (
          <p>No loan applications found.</p>
        ) : (
          applications.map((app) => (
            <div key={app._id} className="p-3 border rounded flex justify-between mb-3">
              <div>
                <p><strong>Status:</strong> {app.status}</p>
                {app.scoresRef && (
                  <>
                    <p><strong>Composite Credit Score:</strong> {app.scoresRef.risk_score}</p>
                    <p><strong>Repayment Score:</strong> {app.scoresRef.repayment_score}</p>
                    <p><strong>Income Score:</strong> {app.scoresRef.income_proxy_score}</p>
                    <p><strong>Risk Band:</strong> {latestScores.risk_band}</p>

                  </>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
