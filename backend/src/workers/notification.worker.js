// Notification Worker — consumes `application.decided` events and sends
// (or, without a provider configured, logs) an SMS/email to the applicant.
// Runs as its own process: `npm run worker:notification`.
import dotenv from "dotenv";
dotenv.config();

import { consumeEvents } from "../services/eventBus.js";

const QUEUE = "notification-worker-queue";
const ROUTING_KEY = "application.decided";

// No SMS/email provider is wired up yet (Fast2SMS was removed from the
// login flow entirely, and no transactional email provider exists in this
// project) — this logs what would be sent so the pipeline is fully
// observable end-to-end. Swap this out for a real provider call (SNS,
// Twilio, SendGrid, etc.) when one is available; the event contract
// upstream doesn't need to change.
async function sendNotification({ applicantName, applicationId, status, risk_band }) {
  const message = `Hi ${applicantName || "there"}, your loan application (${applicationId}) has been assessed: ${risk_band}. Current status: ${status}.`;
  console.log(`📩 [NOTIFICATION] ${message}`);
  return true;
}

async function handle(payload) {
  console.log(`🔔 Notifying applicant for application ${payload.applicationId}`);
  await sendNotification(payload);
}

async function start() {
  await consumeEvents(QUEUE, ROUTING_KEY, handle);
  console.log("🚀 Notification worker is running");
}

start().catch((err) => {
  console.error("❌ Notification worker failed to start:", err.message);
  process.exit(1);
});
