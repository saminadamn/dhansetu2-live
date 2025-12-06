import express from "express";
import cors from "cors";
import loanRoutes from "./routes/loan.routes.js"; 
const app = express();

app.use(cors());
app.use(express.json());

// Base health check route
app.get("/", (req, res) => {
  res.send("Dhansetu backend running 🟢");
});

// Loan route mount
app.use("/api/loans", loanRoutes);

export default app;
