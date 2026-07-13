// src/components/ui/UploadCard.jsx
import { useState } from "react";

export default function UploadCard({ id, label, hint, accept, onChange }) {
  const [file, setFile] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    onChange(selectedFile);
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm space-y-2">
      <label className="font-semibold block">{label}</label>
      <p className="text-xs text-gray-500">{hint}</p>

      <input
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
      />

      {file && (
        <div className="mt-2 bg-green-100 px-3 py-1 rounded text-green-700 font-medium text-sm">
          📄 {file.name} uploaded successfully
        </div>
      )}
    </div>
  );
}
