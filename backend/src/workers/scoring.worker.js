// Scoring Worker — consumes `application.submitted` events, calls the
// Python ML service, and publishes `application.scored`. Runs as its own
// process: `npm run worker:scoring`.
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { consumeEvents, publishEvent } from "../services/eventBus.js";
import { getMLPrediction } from "../services/ml.service.js";
import { logger } from "../config/logger.js";
import { startMetricsServer } from "../config/metrics.js";

const QUEUE = "scoring-worker-queue";
const ROUTING_KEY = "application.submitted";

async function handle({ applicationId, aadhaarHash, mlPayload }, { correlationId, log }) {
  log.info({ applicationId }, "Scoring application");

  const mlResult = await getMLPrediction(mlPayload);

  await publishEvent(
    "application.scored",
    { applicationId, aadhaarHash, mlResult },
    { correlationId }
  );
  log.info({ applicationId }, "Scored application — published application.scored");
}

async function start() {
  // Scoring itself is stateless (no DB writes here — decision worker owns
  // persistence), but connecting keeps this worker consistent with the
  // others and ready if scoring logic ever needs profile lookups directly.
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "dhansetu" });
    logger.info("Scoring worker connected to MongoDB");
  }

  await consumeEvents(QUEUE, ROUTING_KEY, handle);

  const metricsPort = Number(process.env.SCORING_METRICS_PORT || 9101);
  startMetricsServer(metricsPort);
  logger.info({ metricsPort }, "Scoring worker is running");
}

start().catch((err) => {
  logger.error({ err: err.message }, "Scoring worker failed to start");
  process.exit(1);
});
