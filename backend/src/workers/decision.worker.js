// Decision Worker — consumes `application.scored` events, persists the
// Score + updates the LoanApplication record, and publishes
// `application.decided`. Runs as its own process: `npm run worker:decision`.
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { consumeEvents, publishEvent } from "../services/eventBus.js";
import { persistScoreAndUpdateApplication } from "../services/scoring.service.js";

const QUEUE = "decision-worker-queue";
const ROUTING_KEY = "application.scored";

async function handle({ applicationId, aadhaarHash, mlResult }) {
  console.log(`🧾 Recording decision for application ${applicationId}`);

  const { application, savedScore } = await persistScoreAndUpdateApplication({
    applicationId,
    aadhaarHash,
    mlResult,
  });

  await publishEvent("application.decided", {
    applicationId,
    applicantName: application?.applicantName,
    status: application?.status,
    risk_band: mlResult.risk_band,
    risk_score: savedScore.risk_score,
  });

  console.log(`✅ Decision stored for application ${applicationId} — status ${application?.status}`);
}

async function start() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "dhansetu" });
  console.log("✅ Decision worker connected to MongoDB");

  await consumeEvents(QUEUE, ROUTING_KEY, handle);
  console.log("🚀 Decision worker is running");
}

start().catch((err) => {
  console.error("❌ Decision worker failed to start:", err.message);
  process.exit(1);
});
