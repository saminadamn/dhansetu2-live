import { getChannel, EXCHANGE } from "../config/rabbitmq.js";
import { logger } from "../config/logger.js";
import { eventsPublishedTotal, eventsProcessedTotal, workerProcessingDuration } from "../config/metrics.js";

// "TTL + DLX" delayed-retry pattern (the standard RabbitMQ recipe when the
// delayed-message-exchange plugin isn't available): a failed message is
// republished to a per-queue retry-holding queue with a per-message
// `expiration` (the backoff delay). That queue has no consumer — its only
// job is to dead-letter the message back onto the main exchange, with the
// original routing key, once the delay elapses. After MAX_RETRIES failed
// attempts, the message is routed to a final per-queue dead-letter queue
// instead, for manual inspection, rather than retried again.
const RETRY_EXCHANGE = "dhansetu.retry";
const DLX_EXCHANGE = "dhansetu.dlx";
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 2000;

// Publishes an event to the topic exchange. Returns false (never throws)
// if RabbitMQ isn't configured/reachable — callers use that to decide
// whether to fall back to synchronous processing.
export async function publishEvent(routingKey, payload, { correlationId, headers } = {}) {
  const channel = await getChannel();
  if (!channel) return false;

  const buffer = Buffer.from(JSON.stringify(payload));
  const published = channel.publish(EXCHANGE, routingKey, buffer, {
    persistent: true,
    contentType: "application/json",
    correlationId,
    headers,
  });
  eventsPublishedTotal.inc({ routing_key: routingKey });
  return published;
}

// Used by worker processes: binds a durable queue (plus its retry-holding
// and dead-letter queues) to a routing key on the shared topic exchange,
// and invokes `handler(payload, { correlationId, log })` for each message.
// Acks on success. On failure, retries with exponential backoff up to
// MAX_RETRIES, then routes to `${queueName}.dlq` — a message is never
// silently requeued forever and never silently dropped.
export async function consumeEvents(queueName, routingKey, handler) {
  const channel = await getChannel();
  if (!channel) {
    throw new Error(
      "RABBITMQ_URL is not set or the broker is unreachable — workers require RabbitMQ to run."
    );
  }

  await channel.assertExchange(RETRY_EXCHANGE, "direct", { durable: true });
  await channel.assertExchange(DLX_EXCHANGE, "direct", { durable: true });

  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, EXCHANGE, routingKey);

  const retryQueue = `${queueName}.retry`;
  await channel.assertQueue(retryQueue, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": EXCHANGE,
      "x-dead-letter-routing-key": routingKey,
    },
  });
  await channel.bindQueue(retryQueue, RETRY_EXCHANGE, queueName);

  const dlq = `${queueName}.dlq`;
  await channel.assertQueue(dlq, { durable: true });
  await channel.bindQueue(dlq, DLX_EXCHANGE, queueName);

  await channel.prefetch(1);

  channel.consume(queueName, async (msg) => {
    if (!msg) return;

    const correlationId = msg.properties.correlationId;
    const log = logger.child({ correlationId, queue: queueName });
    const retryCount = msg.properties.headers?.["x-retry-count"] || 0;

    const endTimer = workerProcessingDuration.startTimer({ queue: queueName });

    try {
      const payload = JSON.parse(msg.content.toString());
      await handler(payload, { correlationId, log });
      channel.ack(msg);
      endTimer();
      eventsProcessedTotal.inc({ queue: queueName, outcome: "success" });
    } catch (err) {
      endTimer();
      const nextRetryCount = retryCount + 1;
      log.error({ err: err.message, attempt: nextRetryCount }, "Worker handler failed");

      if (nextRetryCount > MAX_RETRIES) {
        log.warn({ maxRetries: MAX_RETRIES }, "Max retries exceeded — routing to dead-letter queue");
        channel.publish(DLX_EXCHANGE, queueName, msg.content, {
          persistent: true,
          correlationId,
          headers: {
            ...msg.properties.headers,
            "x-retry-count": nextRetryCount,
            "x-failure-reason": err.message,
          },
        });
        eventsProcessedTotal.inc({ queue: queueName, outcome: "dead_letter" });
      } else {
        const delayMs = BASE_DELAY_MS * 2 ** retryCount; // exponential backoff
        log.warn({ delayMs, attempt: nextRetryCount }, "Scheduling retry");
        channel.publish(RETRY_EXCHANGE, queueName, msg.content, {
          persistent: true,
          correlationId,
          expiration: String(delayMs),
          headers: { ...msg.properties.headers, "x-retry-count": nextRetryCount },
        });
        eventsProcessedTotal.inc({ queue: queueName, outcome: "retry" });
      }

      // We've taken over this message's fate (rescheduled a delayed retry,
      // or dead-lettered it) — ack the original so it isn't redelivered too.
      channel.ack(msg);
    }
  });

  logger.info({ queue: queueName, routingKey, retryQueue, dlq }, "Worker listening");
}
