import { randomUUID } from "crypto";

// Accepts an inbound X-Correlation-Id (useful if a future gateway/proxy in
// front of this service already generates one) or mints a fresh one.
// Attaches it to req for handlers to read and echoes it back so a client
// can correlate their own logs with ours.
export function correlationId(req, res, next) {
  const id = req.headers["x-correlation-id"] || randomUUID();
  req.correlationId = id;
  res.setHeader("x-correlation-id", id);
  next();
}
