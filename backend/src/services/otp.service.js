import axios from "axios";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
};

// Sends an OTP SMS via Fast2SMS (quick/transactional route).
export const sendOTPViaFast2SMS = async (mobileNumber, otp) => {
  const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
    headers: { authorization: process.env.FAST2SMS_API_KEY },
    params: {
      route: "q",
      message: `Your Dhansetu login OTP is ${otp}. Valid for 5 minutes. Do not share it with anyone.`,
      language: "english",
      flash: 0,
      numbers: mobileNumber,
    },
  });

  if (!response.data?.return) {
    throw new Error(response.data?.message?.join?.(", ") || "Fast2SMS failed to send OTP");
  }

  return true;
};
