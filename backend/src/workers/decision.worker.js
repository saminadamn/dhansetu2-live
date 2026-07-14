// Decision Worker — consumes `application.scored` events, persists the
// Score + updates the LoanApplication record, and publishes
// `application.decided`. Runs as its own process: `npm run worker:decision`.
import "dotenv/config"; // first import so env is set before hoisted imports evaluate

import mongoose from "mongoose";
import { consumeEvents, publishEvent } from "../services/eventBus.js";
import { persistScoreAndUpdateApplication } from "../services/scoring.service.js";
import { logger } from "../config/logger.js";
import { startMetricsServer } from "../config/metrics.js";

const QUEUE = "decision-worker-queue";
const ROUTING_KEY = "application.scored";

async function handle({ applicationId, aadhaarHash, mlResult }, { correlationId, log }) {
  log.info({ applicationId }, "Recording decision for application");

  const { application, savedScore } = await persistScoreAndUpdateApplication({
    applicationId,
    aadhaarHash,
    mlResult,
  });

  await publishEvent(
    "application.decided",
    {
      applicationId,
      applicantName: application?.applicantName,
      status: application?.status,
      risk_band: mlResult.risk_band,
      risk_score: savedScore.risk_score,
    },
    { correlationId }
  );

  log.info({ applicationId, status: application?.status }, "Decision stored");
}

async function start() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "dhansetu" });
  logger.info("Decision worker connected to MongoDB");

  await consumeEvents(QUEUE, ROUTING_KEY, handle);

  const metricsPort = Number(process.env.DECISION_METRICS_PORT || 9102);
  startMetricsServer(metricsPort);
  logger.info({ metricsPort }, "Decision worker is running");
}

start().catch((err) => {
  logger.error({ err: err.message }, "Decision worker failed to start");
  process.exit(1);
});
