import { Router } from "express";
import {
  addFinancialProfile,
  getFinancialProfile,
} from "../controllers/financial.controller.js";

const router = Router();

// admin adds financial profile
router.post("/add", addFinancialProfile);

// fetch by Aadhaar (merge logic for loan apply)
router.get("/:aadhaar", getFinancialProfile);

export default router;
