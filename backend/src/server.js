// backend/server.js
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedDemoAccounts } from "./utils/seedDemoAccounts.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDemoAccounts();
  app.listen(PORT, () => {
    console.log(`🚀 Backend server listening on port ${PORT}`);
  });
};

startServer();
