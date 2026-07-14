import React, { useState, useContext } from "react";
import API from "../../services/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import RoleTabs from "../../components/auth/RoleTabs";

const inputClass =
  "w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-govBlue";

const DEMO_MOBILE = "9999999999";

export default function BeneficiaryLogin() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const doLogin = async (number) => {
    setErrorMsg("");

    if (number.length !== 10) {
      setErrorMsg("Enter a valid 10 digit mobile number");
      return false;
    }

    try {
      const res = await API.post("/auth/beneficiary-login", { mobileNumber: number });
      login({ role: res.data.role, mobileNumber: number }, res.data.token);
      navigate("/dashboard/beneficiary");
      return true;
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Login failed");
      return false;
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    await doLogin(mobileNumber);
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setMobileNumber(DEMO_MOBILE);
    await doLogin(DEMO_MOBILE);
    setDemoLoading(false);
  };

  return (
    <div className="min-h-[65vh] flex items-center justify-center py-8">
      <div className="bg-govBlue rounded-2xl shadow-xl border border-blue-900/40 w-full max-w-md overflow-hidden">
        <RoleTabs active="beneficiary" />

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Welcome to Dhansetu</h2>
            <p className="text-blue-100 text-sm mt-1">
              Login with your mobile number to apply for a loan and track your applications.
            </p>
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400 text-center mb-4 bg-red-50/80 dark:bg-red-950/30 border border-red-100/80 dark:border-red-900/40 rounded-lg py-2.5 tracking-wide">
              {errorMsg}
            </p>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Mobile Number
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="Enter 10 digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                className={inputClass}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || demoLoading}
              className="w-full bg-white text-govBlue font-semibold py-2.5 rounded-lg shadow-md shadow-blue-900/10 text-sm transition-all duration-200 hover:bg-blue-50 active:scale-[0.99] disabled:opacity-60 disabled:hover:bg-white"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 text-center">
            <button
              onClick={handleDemoLogin}
              disabled={loading || demoLoading}
              title="Logs in with a fixed demo mobile number — for presentations/testing only"
              className="text-xs font-medium text-govGold border border-govGold/50 rounded-full px-4 py-1.5 hover:bg-govGold/10 transition disabled:opacity-60"
            >
              {demoLoading ? "Signing in…" : "⚡ Demo Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
