import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import RoleTabs from "../../components/auth/RoleTabs";

const inputClass =
  "w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-govBlue";

const DEMO_EMPLOYEE_ID = "SHG001";
const DEMO_PASSWORD = "demo1234";

export default function ChannelLogin() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const attemptLogin = async (id, pass) => {
    const res = await API.post("/auth/officer-login", { employeeId: id, password: pass });
    login(res.data.officer, res.data.token);
    navigate("/dashboard/channel");
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await attemptLogin(employeeId, password);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setDemoLoading(true);
      setError("");
      setEmployeeId(DEMO_EMPLOYEE_ID);
      setPassword(DEMO_PASSWORD);
      await attemptLogin(DEMO_EMPLOYEE_ID, DEMO_PASSWORD);
    } catch (err) {
      setError(err.response?.data?.message || "Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[65vh] flex items-center justify-center py-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 w-full max-w-md overflow-hidden">
        <RoleTabs active="channel" />

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Third-Party Partner Portal</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              For SHGs, NGOs, and field agents coordinating group loan applications.
            </p>
          </div>

          {error && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400 text-center mb-4 bg-red-50/80 dark:bg-red-950/30 border border-red-100/80 dark:border-red-900/40 rounded-lg py-2.5 tracking-wide">
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
                Partner ID
              </label>
              <input
                className={inputClass}
                placeholder="Enter partner/coordinator ID"
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
              disabled={loading || demoLoading}
              className="w-full bg-slate-900 dark:bg-slate-700 text-white font-semibold py-2.5 rounded-lg shadow-md text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:hover:brightness-100"
            >
              {loading ? "Logging in..." : "Partner Login"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={handleDemoLogin}
              disabled={loading || demoLoading}
              title="Signs in with a seeded demo channel-partner account — for presentations/testing only"
              className="text-xs font-medium text-govGold border border-govGold/50 rounded-full px-4 py-1.5 hover:bg-govGold/10 transition disabled:opacity-60"
            >
              {demoLoading ? "Signing in…" : "⚡ Demo Login (skip credentials)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
