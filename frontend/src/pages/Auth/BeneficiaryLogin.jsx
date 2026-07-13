import React, { useState, useContext } from "react";
import API from "../../services/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import RoleTabs from "../../components/auth/RoleTabs";

const inputClass =
  "w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-govBlue";

const DEMO_MOBILE = "9999999999";
const DEMO_OTP = "123456";

export default function BeneficiaryLogin() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState("mobile"); // "mobile" | "otp"
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSendOTP = async (number = mobileNumber) => {
    setErrorMsg("");

    if (number.length !== 10) {
      setErrorMsg("Enter a valid 10 digit mobile number");
      return false;
    }

    setLoading(true);
    try {
      await API.post("/auth/send-otp", { mobileNumber: number });
      setStep("otp");
      return true;
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to send OTP");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (number = mobileNumber, code = otp) => {
    setErrorMsg("");

    if (code.length !== 6) {
      setErrorMsg("Enter 6 digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", { mobileNumber: number, otp: code });

      login(res.data.role, res.data.token);
      navigate("/dashboard/beneficiary"); // redirect on success

    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Invalid OTP");
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setErrorMsg("");
    setMobileNumber(DEMO_MOBILE);
    setOtp(DEMO_OTP);
    const sent = await handleSendOTP(DEMO_MOBILE);
    if (sent) {
      await handleVerifyOTP(DEMO_MOBILE, DEMO_OTP);
    }
    setDemoLoading(false);
  };

  return (
    <div className="min-h-[65vh] flex items-center justify-center py-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 w-full max-w-md overflow-hidden">
        <RoleTabs active="beneficiary" />

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome to Dhansetu</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Login with your mobile number to apply for a loan and track your applications.
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-6 text-xs font-medium">
            <span className={`flex items-center gap-1.5 ${step === "mobile" ? "text-govBlue dark:text-blue-300" : "text-slate-400 dark:text-slate-500"}`}>
              <span className={`h-5 w-5 rounded-full flex items-center justify-center leading-none text-[11px] ${step === "mobile" ? "bg-govBlue text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>1</span>
              <span>Mobile Number</span>
            </span>
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700 mx-3" />
            <span className={`flex items-center gap-1.5 ${step === "otp" ? "text-govBlue dark:text-blue-300" : "text-slate-400 dark:text-slate-500"}`}>
              <span className={`h-5 w-5 rounded-full flex items-center justify-center leading-none text-[11px] ${step === "otp" ? "bg-govBlue text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>2</span>
              <span>Verify OTP</span>
            </span>
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400 text-center mb-4 bg-red-50/80 dark:bg-red-950/30 border border-red-100/80 dark:border-red-900/40 rounded-lg py-2.5 tracking-wide">
              {errorMsg}
            </p>
          )}

          {step === "mobile" ? (
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
                onClick={() => handleSendOTP()}
                disabled={loading || demoLoading}
                className="w-full bg-govBlue text-white font-semibold py-2.5 rounded-lg shadow-md shadow-blue-900/10 text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:hover:brightness-100"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  One-Time Password
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6 digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className={inputClass}
                />
              </div>

              <button
                onClick={() => handleVerifyOTP()}
                disabled={loading || demoLoading}
                className="w-full bg-govBlue text-white font-semibold py-2.5 rounded-lg shadow-md shadow-blue-900/10 text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:hover:brightness-100"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                onClick={() => { setStep("mobile"); setOtp(""); setErrorMsg(""); }}
                className="w-full text-center text-sm text-slate-500 dark:text-slate-400 hover:text-govBlue dark:hover:text-blue-300 transition"
              >
                ← Change mobile number
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={handleDemoLogin}
              disabled={loading || demoLoading}
              title="Skips real OTP delivery using a pre-verified demo account — for presentations/testing only"
              className="text-xs font-medium text-govGold border border-govGold/50 rounded-full px-4 py-1.5 hover:bg-govGold/10 transition disabled:opacity-60"
            >
              {demoLoading ? "Signing in…" : "⚡ Demo Login (skip OTP)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
