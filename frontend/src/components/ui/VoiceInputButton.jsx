import React, { useState, useRef } from "react";
import API from "../../services/axiosInstance";

export default function VoiceInputButton({ onResult }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => chunks.current.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });

        const res = await API.post("/ai/speech", blob, {
          headers: { "Content-Type": "audio/webm" },
        });

        onResult(res.data.transcript || "");
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Microphone access blocked");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <button
      type="button"
      title={recording ? "Stop recording" : "Speak to fill"}
      onClick={recording ? stopRecording : startRecording}
      className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-7 w-7 rounded-full transition-colors ${
        recording
          ? "text-red-600 bg-red-50 animate-pulse"
          : "text-slate-400 hover:text-govBlue hover:bg-slate-100"
      }`}
    >
      {recording ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="1.5" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
}
