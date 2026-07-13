import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import authRoutes from "./routes/auth.routes.js";
import financialRoutes from "./routes/financial.routes.js";
import loanRoutes from "./routes/loan.routes.js";
import officerRoutes from "./routes/officer.routes.js";
import beneficiaryRoutes from "./routes/beneficiary.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import channelRoutes from "./routes/channel.routes.js";
import bhashiniRoutes from "./routes/bhashini.routes.js";




const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// ⬇ RAW AUDIO PARSER (must be before ai routes)
app.use(
  bodyParser.raw({
    type: "audio/*",
    limit: "20mb"
  })
);
// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/financial", financialRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/officer", officerRoutes);
app.use("/api/beneficiary", beneficiaryRoutes);
app.use("/api/ai", aiRoutes);


app.use("/api/channel", channelRoutes);
app.use("/api/bhashini", bhashiniRoutes);








export default app;
