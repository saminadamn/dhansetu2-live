import { GoogleGenerativeAI } from "@google/generative-ai";

let model = null;
const getModel = () => {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
    model = new GoogleGenerativeAI(apiKey.trim()).getGenerativeModel({ model: "gemini-2.5-flash" });
  }
  return model;
};

// OCR
export const extractTextFromImage = async (req, res) => {
  try {
    if (!req.files?.image) return res.status(400).json({ error: "No image uploaded" });

    const model = getModel();
    const img = req.files.image;
    const base64 = img.data.toString("base64");

    const result = await model.generateContent([
      "Extract readable text from this image. Return only plain text.",
      { inlineData: { data: base64, mimeType: img.mimetype } }
    ]);

    res.json({ text: result.response.text() });

  } catch (error) {
    console.error("OCR error:", error);
    res.status(500).json({ error: "OCR failed" });
  }
};

// SPEECH TO TEXT
export const convertSpeechToText = async (req, res) => {
  try {
    console.log("Audio received:", req.body?.length);

    if (!req.body?.length) {
      return res.status(400).json({ error: "No audio received" });
    }

    const audioBytes = req.body;
    const model = getModel();

    const result = await model.generateContent([
      "Transcribe the following audio to text:",
      {
        inlineData: {
          data: audioBytes.toString("base64"),
          mimeType: req.headers["content-type"]
        }
      }
    ]);

    const transcript = result.response.text();
    return res.json({ transcript });

  } catch (error) {
    console.error("Speech error:", error);
    return res.status(500).json({ message: "Speech-to-text failed" });
  }
};

