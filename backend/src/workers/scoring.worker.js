// Scoring Worker — consumes `application.submitted` events, calls the
// Python ML service, and publishes `application.scored`. Runs as its own
// process: `npm run worker:scoring`.
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { consumeEvents, publishEvent } from "../services/eventBus.js";
import { getMLPrediction } from "../services/ml.service.js";

const QUEUE = "scoring-worker-queue";
const ROUTING_KEY = "application.submitted";

async function handle({ applicationId, aadhaarHash, mlPayload }) {
  console.log(`⚙️  Scoring application ${applicationId}`);

  const mlResult = await getMLPrediction(mlPayload);

  await publishEvent("application.scored", { applicationId, aadhaarHash, mlResult });
  console.log(`✅ Scored application ${applicationId} — published application.scored`);
}

async function start() {
  // Scoring itself is stateless (no DB writes here — decision worker owns
  // persistence), but connecting keeps this worker consistent with the
  // others and ready if scoring logic ever needs profile lookups directly.
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "dhansetu" });
    console.log("✅ Scoring worker connected to MongoDB");
  }

  await consumeEvents(QUEUE, ROUTING_KEY, handle);
  console.log("🚀 Scoring worker is running");
}

start().catch((err) => {
  console.error("❌ Scoring worker failed to start:", err.message);
  process.exit(1);
});
