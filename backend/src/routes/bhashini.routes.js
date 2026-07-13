import express from "express";
import { translate } from "../controllers/bhashini.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/translate", translate);

export default router;
