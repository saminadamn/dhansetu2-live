import { rateLimit } from "express-rate-limit";

const standardHeaders = true;
const legacyHeaders = false;

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders,
  legacyHeaders,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
});

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders,
  legacyHeaders,
  message: { message: "Too many upload requests. Please try again in 15 minutes." },
});
