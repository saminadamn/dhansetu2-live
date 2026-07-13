import { getChannel, EXCHANGE } from "../config/rabbitmq.js";

// Publishes an event to the topic exchange. Returns false (never throws)
// if RabbitMQ isn't configured/reachable — callers use that to decide
// whether to fall back to synchronous processing.
export async function publishEvent(routingKey, payload) {
  const channel = await getChannel();
  if (!channel) return false;

  const buffer = Buffer.from(JSON.stringify(payload));
  return channel.publish(EXCHANGE, routingKey, buffer, {
    persistent: true,
    contentType: "application/json",
  });
}

// Used by worker processes: binds a durable queue to a routing key on the
// shared topic exchange and invokes `handler(payload)` for each message.
// Acks on success, nacks-with-requeue on failure so a crashed worker
// doesn't silently drop work.
export async function consumeEvents(queueName, routingKey, handler) {
  const channel = await getChannel();
  if (!channel) {
    throw new Error(
      "RABBITMQ_URL is not set or the broker is unreachable — workers require RabbitMQ to run."
    );
  }

  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, EXCHANGE, routingKey);
  await channel.prefetch(1);

  channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      const payload = JSON.parse(msg.content.toString());
      await handler(payload);
      channel.ack(msg);
    } catch (err) {
      console.error(`❌ Worker error processing ${routingKey}:`, err.message);
      channel.nack(msg, false, true); // requeue for retry
    }
  });

  console.log(`👂 Listening on queue "${queueName}" for routing key "${routingKey}"`);
}
