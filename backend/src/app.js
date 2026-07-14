import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pinoHttp from "pino-http";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { logger } from "./config/logger.js";
import { correlationId } from "./middlewares/correlationId.js";
import { register, metricsMiddleware } from "./config/metrics.js";
import { swaggerSpec } from "./config/swagger.js";
import { authRateLimiter, uploadRateLimiter } from "./middlewares/rateLimiters.js";

import authRoutes from "./routes/auth.routes.js";
import financialRoutes from "./routes/financial.routes.js";
import loanRoutes from "./routes/loan.routes.js";
import officerRoutes from "./routes/officer.routes.js";
import beneficiaryRoutes from "./routes/beneficiary.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import channelRoutes from "./routes/channel.routes.js";
import bhashiniRoutes from "./routes/bhashini.routes.js";
import uploadRoutes from "./routes/upload.routes.js";




const app = express();

app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(correlationId);
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.correlationId,
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  })
);

app.use(metricsMiddleware);

// Scraped by Prometheus (see README "Observability"). Intentionally
// unauthenticated/unprefixed — that's the Prometheus convention, and this
// exposes no application data, only request/process/pipeline counters.
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ⬇ RAW AUDIO PARSER (must be before ai routes)
app.use(
  bodyParser.raw({
    type: "audio/*",
    limit: "20mb"
  })
);
// Register routes
// swagger-ui injects its bootstrap script inline; scope this exception to the
// documentation page rather than weakening Helmet's CSP for the API.
app.use("/api/docs", (req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'");
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/financial", financialRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/officer", officerRoutes);
app.use("/api/beneficiary", beneficiaryRoutes);
app.use("/api/ai", aiRoutes);


app.use("/api/channel", channelRoutes);
app.use("/api/bhashini", bhashiniRoutes);
app.use("/api/uploads", uploadRateLimiter, uploadRoutes);

app.use((error, req, res, next) => {
  if (error.type === "entity.too.large" || error.status === 413) {
    return res.status(413).json({ message: "Request body is too large" });
  }
  return next(error);
});








export default app;
