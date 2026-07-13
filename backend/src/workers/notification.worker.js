// Notification Worker — consumes `application.decided` events and sends
// (or, without a provider configured, logs) an SMS/email to the applicant.
// Runs as its own process: `npm run worker:notification`.
import dotenv from "dotenv";
dotenv.config();

import { consumeEvents } from "../services/eventBus.js";
import { logger } from "../config/logger.js";
import { startMetricsServer } from "../config/metrics.js";

const QUEUE = "notification-worker-queue";
const ROUTING_KEY = "application.decided";

// No SMS/email provider is wired up yet (Fast2SMS was removed from the
// login flow entirely, and no transactional email provider exists in this
// project) — this logs what would be sent so the pipeline is fully
// observable end-to-end. Swap this out for a real provider call (SNS,
// Twilio, SendGrid, etc.) when one is available; the event contract
// upstream doesn't need to change.
async function sendNotification({ applicantName, applicationId, status, risk_band }, log) {
  const message = `Hi ${applicantName || "there"}, your loan application (${applicationId}) has been assessed: ${risk_band}. Current status: ${status}.`;
  log.info({ applicationId, channel: "sms+email" }, message);
  return true;
}

async function handle(payload, { log }) {
  log.info({ applicationId: payload.applicationId }, "Notifying applicant");
  await sendNotification(payload, log);
}

async function start() {
  await consumeEvents(QUEUE, ROUTING_KEY, handle);

  const metricsPort = Number(process.env.NOTIFICATION_METRICS_PORT || 9103);
  startMetricsServer(metricsPort);
  logger.info({ metricsPort }, "Notification worker is running");
}

start().catch((err) => {
  logger.error({ err: err.message }, "Notification worker failed to start");
  process.exit(1);
});
