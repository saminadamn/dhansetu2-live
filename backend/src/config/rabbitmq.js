import amqp from "amqplib";

export const EXCHANGE = "dhansetu.events";

let connection = null;
let channel = null;
let connecting = null;

// Lazily connects once and reuses the channel. Returns null (never throws)
// when RABBITMQ_URL isn't set or the broker can't be reached — callers use
// that to decide whether to fall back to synchronous processing instead of
// the async event pipeline.
export async function getChannel() {
  if (channel) return channel;
  if (!process.env.RABBITMQ_URL) return null;

  if (!connecting) {
    connecting = (async () => {
      try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        connection.on("error", (err) => {
          console.error("❌ RabbitMQ connection error:", err.message);
          channel = null;
          connection = null;
          connecting = null;
        });
        connection.on("close", () => {
          console.warn("⚠️ RabbitMQ connection closed");
          channel = null;
          connection = null;
          connecting = null;
        });

        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE, "topic", { durable: true });
        console.log("✅ Connected to RabbitMQ");
        return channel;
      } catch (err) {
        console.error("❌ Failed to connect to RabbitMQ, falling back to sync mode:", err.message);
        connection = null;
        channel = null;
        connecting = null;
        return null;
      }
    })();
  }

  return connecting;
}

export async function closeConnection() {
  try {
    await channel?.close();
    await connection?.close();
  } catch {
    // best-effort shutdown
  }
}
