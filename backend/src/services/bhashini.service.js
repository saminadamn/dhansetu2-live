import axios from "axios";

// Bhashini (bhashini.gov.in) exposes its APIs through the ULCA pipeline
// pattern: first fetch a pipeline config for the task(s) you need, then call
// the inference endpoint(s) the config returns. Credentials come from
// https://bhashini.gov.in — set BHASHINI_USER_ID, BHASHINI_UDYAT_API_KEY and
// BHASHINI_INFERENCE_API_KEY once you have them; until then, translateText()
// throws a clear "not configured" error so callers can fall back to the
// app's existing static i18next translations / Gemini-based voice
// transcription.

const PIPELINE_CONFIG_URL =
  "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline";

const DEFAULT_PIPELINE_ID = "64392f96daac500b55c543cd";

export function isBhashiniConfigured() {
  return Boolean(
    process.env.BHASHINI_USER_ID &&
      process.env.BHASHINI_UDYAT_API_KEY &&
      process.env.BHASHINI_INFERENCE_API_KEY
  );
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
      pipelineRequestConfig: {
        pipelineId: process.env.BHASHINI_PIPELINE_ID || DEFAULT_PIPELINE_ID,
      },
    },
    {
      headers: {
        userID: process.env.BHASHINI_USER_ID,
        ulcaApiKey: process.env.BHASHINI_UDYAT_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  cachedPipeline = data;
  return data;
}

// Translate text via Bhashini. Throws if credentials are not set — callers
// should catch this and fall back gracefully.
export async function translateText(text, sourceLanguage, targetLanguage) {
  if (!isBhashiniConfigured()) {
    throw new Error(
      "Bhashini is not configured (missing BHASHINI_USER_ID / BHASHINI_UDYAT_API_KEY / BHASHINI_INFERENCE_API_KEY)"
    );
  }

  const pipeline = await getTranslationPipeline(sourceLanguage, targetLanguage);
  const callbackUrl = pipeline.pipelineInferenceAPIEndPoint.callbackUrl;
  const serviceId = pipeline.pipelineResponseConfig[0].config[0].serviceId;

  // Bhashini's inference call is normally authorized with a per-service key
  // returned dynamically inside the pipeline config response. Some accounts
  // are instead issued one fixed inference key up front (BHASHINI_INFERENCE_API_KEY)
  // — prefer the dynamic one when present, fall back to the fixed one.
  const dynamicKey = pipeline.pipelineInferenceAPIEndPoint?.inferenceApiKey;
  const authHeaderName = dynamicKey?.name || "Authorization";
  const authHeaderValue = dynamicKey?.value || process.env.BHASHINI_INFERENCE_API_KEY;

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
        [authHeaderName]: authHeaderValue,
        "Content-Type": "application/json",
      },
    }
  );

  return data.pipelineResponse[0].output[0].target;
}
