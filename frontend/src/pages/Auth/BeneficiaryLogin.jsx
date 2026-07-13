import React, { useState, useContext } from "react";
import API from "../../services/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const inputClass =
  "w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white transition focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-govBlue";

export default function BeneficiaryLogin() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState("mobile"); // "mobile" | "otp"
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSendOTP = async () => {
    setErrorMsg("");

    if (mobileNumber.length !== 10) {
      setErrorMsg("Enter a valid 10 digit mobile number");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/send-otp", { mobileNumber });
      setStep("otp");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setErrorMsg("");

    if (otp.length !== 6) {
      setErrorMsg("Enter 6 digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", { mobileNumber, otp });

      login(res.data.role, res.data.token);
      navigate("/dashboard/beneficiary"); // redirect on success

    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Invalid OTP");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[65vh] flex items-center justify-center py-8">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden">
        {/* Role selector tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/60 p-2 gap-2">
          <span className="flex-1 py-2.5 text-center text-sm font-medium rounded-xl bg-white text-govBlue shadow-sm border border-slate-200/70">
            Beneficiary / Citizen
          </span>
          <a
            href="/login/officer"
            className="flex-1 py-2.5 text-center text-sm font-medium rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/60 transition"
          >
            Internal Officer
          </a>
        </div>

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Welcome to Dhansetu</h2>
            <p className="text-slate-500 text-sm mt-1">
              Login with your mobile number to apply for a loan and track your applications.
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6 text-xs font-medium">
            <span className={`flex items-center gap-1.5 ${step === "mobile" ? "text-govBlue" : "text-slate-400"}`}>
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] ${step === "mobile" ? "bg-govBlue text-white" : "bg-slate-200 text-slate-500"}`}>1</span>
              Mobile Number
            </span>
            <span className="flex-1 h-px bg-slate-200" />
            <span className={`flex items-center gap-1.5 ${step === "otp" ? "text-govBlue" : "text-slate-400"}`}>
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] ${step === "otp" ? "bg-govBlue text-white" : "bg-slate-200 text-slate-500"}`}>2</span>
              Verify OTP
            </span>
          </div>

          {errorMsg && (
            <p className="text-red-600 text-sm text-center mb-4 bg-red-50 border border-red-100 rounded-lg py-2">
              {errorMsg}
            </p>
          )}

          {step === "mobile" ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
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
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-govBlue text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition-colors shadow-md shadow-blue-900/10 text-sm disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
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
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full bg-govBlue text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition-colors shadow-md shadow-blue-900/10 text-sm disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                onClick={() => { setStep("mobile"); setOtp(""); setErrorMsg(""); }}
                className="w-full text-center text-sm text-slate-500 hover:text-govBlue transition"
              >
                ← Change mobile number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
