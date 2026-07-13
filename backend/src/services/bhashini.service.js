import axios from "axios";

// Bhashini (bhashini.gov.in) exposes its APIs through the ULCA pipeline
// pattern: first fetch a pipeline config for the task(s) you need, then call
// the inference endpoint(s) the config returns. Credentials come from
// https://bhashini.gov.in — set BHASHINI_USER_ID and BHASHINI_API_KEY once
// you have them; until then, translateText() throws a clear "not configured"
// error so callers can fall back to the app's existing static i18next
// translations / Gemini-based voice transcription.

const PIPELINE_CONFIG_URL =
  "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline";

export function isBhashiniConfigured() {
  return Boolean(process.env.BHASHINI_USER_ID && process.env.BHASHINI_API_KEY);
}

let cachedPipeline = null;

async function getTranslationPipeline(sourceLanguage, targetLanguage) {
  if (cachedPipeline) return cachedPipeline;

  const { data } = await axios.post(
    PIPELINE_CONFIG_URL,
    {
      pipelineTasks: [
        {
          taskType: "translation",
          config: { language: { sourceLanguage, targetLanguage } },
        },
      ],
      pipelineRequestConfig: { pipelineId: "64392f96daac500b55c543cd" },
    },
    {
      headers: {
        userID: process.env.BHASHINI_USER_ID,
        ulcaApiKey: process.env.BHASHINI_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  cachedPipeline = data;
  return data;
}

// Translate text via Bhashini. Throws if BHASHINI_USER_ID/BHASHINI_API_KEY
// are not set — callers should catch this and fall back gracefully.
export async function translateText(text, sourceLanguage, targetLanguage) {
  if (!isBhashiniConfigured()) {
    throw new Error("Bhashini is not configured (missing BHASHINI_USER_ID / BHASHINI_API_KEY)");
  }

  const pipeline = await getTranslationPipeline(sourceLanguage, targetLanguage);
  const callbackUrl = pipeline.pipelineInferenceAPIEndPoint.callbackUrl;
  const inferenceApiKey = pipeline.pipelineInferenceAPIEndPoint.inferenceApiKey;
  const serviceId =
    pipeline.pipelineResponseConfig[0].config[0].serviceId;

  const { data } = await axios.post(
    callbackUrl,
    {
      pipelineTasks: [
        {
          taskType: "translation",
          config: {
            language: { sourceLanguage, targetLanguage },
            serviceId,
          },
        },
      ],
      inputData: { input: [{ source: text }] },
    },
    {
      headers: {
        [inferenceApiKey.name]: inferenceApiKey.value,
        "Content-Type": "application/json",
      },
    }
  );

  return data.pipelineResponse[0].output[0].target;
}
