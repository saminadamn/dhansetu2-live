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
      onClick={recording ? stopRecording : startRecording}
      className={`ml-2 px-3 py-1 rounded ${recording ? "bg-red-600" : "bg-blue-600"} text-white`}
    >
      {recording ? "⏹ Stop" : "🎤 Speak"}
    </button>
  );
}
