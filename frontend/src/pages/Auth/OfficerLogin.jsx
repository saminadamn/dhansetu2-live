import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import RoleTabs from "../../components/auth/RoleTabs";

const inputClass =
  "w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-govBlue";

export default function OfficerLogin() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/officer-login", { employeeId, password });


      login(res.data.officer, res.data.token);
      navigate("/dashboard/officer");

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[65vh] flex items-center justify-center py-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 w-full max-w-md overflow-hidden">
        <RoleTabs active="officer" />

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Officer Portal</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Verification & administration access control.
            </p>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center mb-4 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 rounded-lg py-2">
              {error}
            </p>
          )}

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Employee ID
              </label>
              <input
                className={inputClass}
                placeholder="Enter employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-slate-700 text-white font-semibold py-2.5 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-md text-sm disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Secure Officer Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
