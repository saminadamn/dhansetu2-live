// routes/officer.routes.js
import express from "express";
import {
  getAllApplications,
  getApplicationDetails,
  updateApplicationDecision,
} from "../controllers/officer.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = express.Router();

router.use(authMiddleware, authorizeRole("officer"));

router.get("/applications", getAllApplications);
router.get("/applications/:id", getApplicationDetails);
router.patch("/applications/:id/decision", updateApplicationDecision);

export default router;
