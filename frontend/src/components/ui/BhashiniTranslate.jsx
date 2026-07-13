import { useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../../services/axiosInstance.js";

// Lets a user translate a piece of help text into their selected app
// language via the Bhashini API. Degrades gracefully: if the backend
// hasn't been configured with real Bhashini credentials yet
// (POST /api/bhashini/translate -> 503), this just says so instead of
// erroring — the rest of the app keeps using its static i18next strings.
export default function BhashiniTranslate({ text }) {
  const { i18n } = useTranslation();
  const [translated, setTranslated] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | unavailable | error

  const targetLanguage = i18n.resolvedLanguage || i18n.language || "en";

  const handleTranslate = async () => {
    if (targetLanguage === "en") {
      setTranslated(text);
      setStatus("done");
      return;
    }

    setStatus("loading");
    try {
      const res = await API.post("/bhashini/translate", {
        text,
        sourceLanguage: "en",
        targetLanguage,
      });
      setTranslated(res.data.translation);
      setStatus("done");
    } catch (err) {
      if (err.response?.status === 503) {
        setStatus("unavailable");
      } else {
        setStatus("error");
      }
    }
  };

  return (
    <div className="text-xs">
      <button
        type="button"
        onClick={handleTranslate}
        disabled={status === "loading"}
        className="text-govBlue dark:text-blue-300 font-medium hover:underline disabled:opacity-60"
      >
        {status === "loading" ? "Translating…" : "🌐 Translate with Bhashini"}
      </button>

      {status === "done" && (
        <p className="mt-1.5 text-slate-600 dark:text-slate-400 italic">{translated}</p>
      )}
      {status === "unavailable" && (
        <p className="mt-1.5 text-slate-400 dark:text-slate-500">
          Bhashini isn't configured on this server yet — showing the default language instead.
        </p>
      )}
      {status === "error" && (
        <p className="mt-1.5 text-red-500">Translation failed. Please try again.</p>
      )}
    </div>
  );
}
