import React, { useState, useContext } from "react";
import API from "../../services/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-4">Beneficiary Login</h2>

        {errorMsg && <p className="text-red-600 text-center mb-4">{errorMsg}</p>}

        {step === "mobile" ? (
          <>
            <input
              type="text"
              maxLength={10}
              placeholder="Enter 10 digit mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
              className="border w-full px-4 py-2 rounded-lg mb-4"
            />

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="bg-blue-600 w-full text-white py-2 rounded-lg"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              maxLength={6}
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="border w-full px-4 py-2 rounded-lg mb-4"
            />

            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="bg-blue-600 w-full text-white py-2 rounded-lg"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={() => { setStep("mobile"); setOtp(""); setErrorMsg(""); }}
              className="w-full text-sm text-slate-500 mt-3"
            >
              Change mobile number
            </button>
          </>
        )}
      </div>
    </div>
  );
}
