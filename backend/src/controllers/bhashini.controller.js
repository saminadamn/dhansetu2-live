import { translateText, isBhashiniConfigured } from "../services/bhashini.service.js";

// POST /api/bhashini/translate
export const translate = async (req, res) => {
  const { text, sourceLanguage, targetLanguage } = req.body;

  if (!text || !sourceLanguage || !targetLanguage) {
    return res.status(400).json({ message: "text, sourceLanguage and targetLanguage are required" });
  }

  if (!isBhashiniConfigured()) {
    // Not an error — lets the frontend fall back to its built-in i18next
    // translations without surfacing a scary failure to the user.
    return res.status(503).json({
      configured: false,
      message: "Bhashini API is not configured on this server yet",
    });
  }

  try {
    const target = await translateText(text, sourceLanguage, targetLanguage);
    return res.json({ configured: true, translation: target });
  } catch (error) {
    console.error("Bhashini translate error:", error.message);
    return res.status(502).json({ configured: true, message: "Bhashini translation failed" });
  }
};
