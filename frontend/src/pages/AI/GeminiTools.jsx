import React, { useState, useRef } from "react";
import API from "../../services/axiosInstance";

export default function GeminiTools() {
  const [ocrText, setOcrText] = useState("");
  const [speechText, setSpeechText] = useState("");
  const [imagePreview, setPreview] = useState(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  // IMAGE → OCR
  const uploadImage = async (e) => {
    const file = e.target.files[0];
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("image", file);

    const res = await API.post("/ai/ocr", formData);

    setOcrText(res.data.text);
  };

  // AUDIO → SPEECH
  const startRecording = async () => {
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

      setSpeechText(res.data.transcript);
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Gemini OCR + Speech-to-Text</h1>

      {/* OCR */}
      <input type="file" accept="image/*" onChange={uploadImage} />

      {imagePreview && <img src={imagePreview} className="max-h-60 rounded" />}
      <textarea className="w-full h-32 border p-2" value={ocrText} readOnly />

      {/* Speech */}
      {!recording ? (
        <button onClick={startRecording}>🎙 Start Recording</button>
      ) : (
        <button onClick={stopRecording}>🛑 Stop</button>
      )}

      <textarea className="w-full h-32 border p-2" value={speechText} readOnly />
    </div>
  );
}
