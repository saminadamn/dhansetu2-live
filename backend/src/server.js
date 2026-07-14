// backend/server.js
// "dotenv/config" MUST be the first import: ES module imports are hoisted
// and evaluated in order before any of this file's own code runs, so a
// `dotenv.config()` call placed after `import app` would run too late —
// app.js reads FRONTEND_URL at module scope to build the CORS allowlist,
// and it would silently see undefined (this exact bug blocked the real
// frontend origin and made every login fail with a CORS error).
import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedDemoAccounts } from "./utils/seedDemoAccounts.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDemoAccounts();
  app.listen(PORT, () => {
    console.log(`🚀 Backend server listening on port ${PORT}`);
  });
};

startServer();
