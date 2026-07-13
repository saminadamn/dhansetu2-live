import pino from "pino";

// Human-readable in dev (nodemon TTY), plain JSON in production so log
// aggregators (Render's log stream, etc.) can parse it. Every child logger
// created with `.child({ correlationId })` carries that field on every line,
// which is what lets you grep one request's journey across the API and
// all three workers.
const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isDev
    ? {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
      }
    : undefined,
});
