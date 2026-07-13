import client from "prom-client";
import http from "http";

export const register = new client.Registry();
client.collectDefaultMetrics({ register }); // process/event-loop/GC metrics for free

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

export const eventsPublishedTotal = new client.Counter({
  name: "events_published_total",
  help: "Total events published to RabbitMQ",
  labelNames: ["routing_key"],
  registers: [register],
});

export const eventsProcessedTotal = new client.Counter({
  name: "events_processed_total",
  help: "Total events consumed by workers, by outcome",
  labelNames: ["queue", "outcome"], // outcome: success | retry | dead_letter
  registers: [register],
});

export const workerProcessingDuration = new client.Histogram({
  name: "worker_processing_duration_seconds",
  help: "Time spent in a worker's message handler",
  labelNames: ["queue"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// Express middleware — records duration + count for every request. Uses
// req.route when available (keeps label cardinality sane) and falls back
// to the raw path otherwise.
export function metricsMiddleware(req, res, next) {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    const route = req.route?.path ? `${req.baseUrl}${req.route.path}` : req.path;
    const labels = { method: req.method, route, status_code: res.statusCode };
    end(labels);
    httpRequestsTotal.inc(labels);
  });
  next();
}

// Workers have no HTTP server of their own — this gives each one a tiny
// dedicated one just for /metrics, so a Prometheus scrape config can point
// at each worker process independently (same pattern as scraping any other
// service's sidecar). Distinct default ports per worker so they can all
// run on one machine during local dev without colliding.
export function startMetricsServer(port) {
  const server = http.createServer(async (req, res) => {
    if (req.url !== "/metrics") {
      res.writeHead(404).end();
      return;
    }
    res.setHeader("Content-Type", register.contentType);
    res.end(await register.metrics());
  });
  server.listen(port);
  return server;
}
