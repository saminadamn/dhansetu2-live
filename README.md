# Dhansetu

A loan-eligibility and credit-scoring platform for beneficiaries, officers, and channel partners. Beneficiaries log in with just their mobile number; a Python ML service scores each application; officers review and approve/reject applications; channel partners (SHGs/NGOs/field agents) log in separately and bulk-import financial data via CSV.

## Architecture

- **`frontend/`** — React 19 + Vite + Tailwind. Multi-language UI (22 Indian languages via i18next).
- **`backend/`** — Node.js + Express 5 + MongoDB (Mongoose). Issues JWTs, orchestrates loan applications, calls the ML service.
- **`ml_model/`** — FastAPI + scikit-learn/XGBoost + SHAP. Exposes `POST /predict`, called server-to-server by the backend (never directly by the frontend).

### Asynchronous scoring pipeline

```
Client → API Gateway (Express) → RabbitMQ → Scoring Worker → Decision Worker → Notification Worker → MongoDB
```

`POST /api/loans/apply` creates the `LoanApplication` record immediately (status `PENDING`, no score yet) and publishes an `application.submitted` event, returning `202` right away — the request never blocks on the ML call. Three independent worker processes (`backend/src/workers/`) then carry it the rest of the way:

1. **Scoring Worker** consumes `application.submitted`, calls the ML service's `/predict`, and publishes `application.scored`.
2. **Decision Worker** consumes `application.scored`, persists the `Score` document and attaches it to the `LoanApplication`, and publishes `application.decided`.
3. **Notification Worker** consumes `application.decided` and sends (currently: logs — no SMS/email provider is wired up yet, see the code comment in `notification.worker.js`) a status update to the applicant.

**RabbitMQ, not Kafka**: both would work for this, but Kafka needs a JVM broker (plus Zookeeper or KRaft mode) for a workload this size — that's a lot of operational weight for a hackathon-scale project. RabbitMQ is a single lightweight service with a mature Node client (`amqplib`) and free hosted options (e.g. [CloudAMQP](https://www.cloudamqp.com/)), which is what `render.yaml` assumes since Render itself doesn't offer a managed broker.

**Graceful fallback**: if `RABBITMQ_URL` isn't set (or the broker is unreachable), `applyForLoan` scores synchronously in-request instead — same code path (`scoring.service.js`) that the Decision Worker uses, just called inline. This means the app works end-to-end with zero extra infrastructure; RabbitMQ is additive, not required. This was verified locally end-to-end (Docker RabbitMQ + MongoDB, all three workers, the real trained models) — a submitted application correctly flowed through all three workers and landed in MongoDB with its full SHAP explanation attached.

Run the workers locally with `npm run worker:scoring`, `npm run worker:decision`, `npm run worker:notification` (each in `backend/`, each its own process/terminal).

### Observability

- **Structured logging** — every backend/worker log line is JSON (pretty-printed in dev via `pino-pretty`) via `backend/src/config/logger.js`. Every HTTP request gets a correlation ID (`req.correlationId`, echoed back as the `X-Correlation-Id` response header) that also rides along as the AMQP message's `correlationId` property through the whole pipeline — grep any worker's logs for one ID and see that single application's entire journey across all three workers.
- **Retries with exponential backoff + dead-letter queue** — `eventBus.js` implements the standard RabbitMQ "TTL + DLX" delayed-retry pattern: a failed message retries up to 5 times (2s, 4s, 8s, 16s, 32s delays) via a per-queue `<queue>.retry` holding queue, then gets routed to `<queue>.dlq` for manual inspection instead of retrying forever or being silently dropped. **Verified for real**: killed the ML service mid-pipeline, watched the scoring worker retry with the logged delays increasing exactly as expected (same correlation ID on every attempt), confirmed the message landed in `scoring-worker-queue.dlq` via the RabbitMQ management API after all 5 retries were exhausted, then brought the ML service back and confirmed a fresh application scored normally.
- **Prometheus metrics** — `GET /metrics` on the backend (`http_requests_total`, `http_request_duration_seconds`, `events_published_total`, plus default Node process metrics) and on the ML service (via `prometheus-fastapi-instrumentator`). Each worker, having no HTTP server of its own, runs a tiny dedicated one just for `/metrics` (ports `9101`/`9102`/`9103` for scoring/decision/notification respectively, overridable via `SCORING_METRICS_PORT`/`DECISION_METRICS_PORT`/`NOTIFICATION_METRICS_PORT`), exposing `events_processed_total{queue,outcome}` (`success`/`retry`/`dead_letter`) and `worker_processing_duration_seconds`. Point a Grafana instance at any of these — no code changes needed, just a Prometheus scrape config.

## Local setup

### 1. ML service

```bash
cd ml_model
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in the values, see below
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev
```

## Environment variables

### `backend/.env`

| Variable | Required | Notes |
|---|---|---|
| `PORT` | no | defaults to 5000 |
| `MONGODB_URI` | yes | MongoDB connection string |
| `ML_API_URL` | yes | full URL to the ML service's `/predict` endpoint |
| `JWT_SECRET` | yes | signs/verifies login tokens |
| `GEMINI_API_KEY` | yes | powers OCR + speech-to-text (`/api/ai/*`) |
| `FRONTEND_URL` | yes | comma-separated allowed CORS origins |
| `BHASHINI_USER_ID` / `BHASHINI_UDYAT_API_KEY` / `BHASHINI_INFERENCE_API_KEY` | no | credentials from [bhashini.gov.in](https://bhashini.gov.in) for `POST /api/bhashini/translate`. If unset, that endpoint returns `503 { configured: false }` and the frontend keeps using its built-in i18next translations. |
| `BHASHINI_PIPELINE_ID` | no | defaults to Bhashini's public translation pipeline ID if unset |
| `RABBITMQ_URL` | no | enables the async scoring pipeline (see above). Unset/unreachable → synchronous fallback. |
| `LOG_LEVEL` | no | pino log level (`info` default) — set `debug` for verbose output |
| `SCORING_METRICS_PORT` / `DECISION_METRICS_PORT` / `NOTIFICATION_METRICS_PORT` | no | port each worker's `/metrics` server listens on (defaults `9101`/`9102`/`9103`) |

### `frontend/.env`

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | yes | backend base URL including `/api` |

## Authentication model

- **Beneficiaries** log in with just a mobile number (`POST /api/auth/beneficiary-login`) — no OTP/SMS step. The account is created on first login. Receives a JWT with `role: "beneficiary"`.
- **Officers** log in with employee ID + password (`POST /api/auth/officer-login`).
- **Channel partners** (SHGs/NGOs/field agents) log in the same way, at `/login/channel` — same endpoint as officers, but their account's `role` field is `"channel"`, which is what the issued JWT is scoped to.
- Both officer and channel-partner accounts must be provisioned ahead of time (no self-signup) — see "Demo accounts" below for how a fresh deployment gets its first ones.
- All protected routes require `Authorization: Bearer <token>` and are role-gated via `authorizeRole` in `backend/src/middlewares/`. The frontend mirrors this with `ProtectedRoute` (`frontend/src/components/auth/ProtectedRoute.jsx`) so an unauthenticated visit to any dashboard/apply route redirects to the matching login page instead of rendering with no data.

Known limitation: a beneficiary's JWT is scoped by role only, not by Aadhaar number — the app never links a verified phone number to a specific Aadhaar identity. Anyone authenticated as a beneficiary can currently query loan/application history for any Aadhaar number they enter. The frontend works around this by remembering the Aadhaar used on the beneficiary's last loan application in `localStorage` (falling back to a manual "enter your Aadhaar" prompt on `/dashboard/beneficiary` otherwise) so "My Applications" has something to look up by — but this is not real authorization. Closing the gap for production requires deciding how Aadhaar gets bound to a verified identity (e.g. collected and locked in at first login) — a product decision, not just a wiring fix.

### Aadhaar handling

The raw Aadhaar number is never persisted. `backend/src/utils/hashAadhaar.js` SHA-256 hashes it the moment a request lands (`FinancialProfile`, `LoanApplication`, and `Score` all store `aadhaarHash` + `aadhaarLast4`, never the number itself) — the hash is the lookup/join key everywhere, and `aadhaarLast4` exists purely so the UI can show `****-****-1234` style masking. The frontend still collects and transmits the full number (form submission, Aadhaar-lookup on "My Applications") since a hash can't be reversed to look anything up by partial input — it's just never written to the database. Note the number still appears in plaintext in request URLs/bodies and any server access logs, which hashing at the DB layer doesn't address; that would need a different fix (e.g. moving Aadhaar lookups to a request body instead of a URL param) if request-log exposure matters for your deployment.

### Demo accounts

`backend/src/utils/seedDemoAccounts.js` runs on every server start and idempotently creates two accounts if they don't already exist, so a fresh database always has something to log in as:

| Role | Login | Credentials |
|---|---|---|
| Officer | `/login/officer` | Employee ID `DEMO001` / password `demo1234` |
| Channel partner | `/login/channel` | Partner ID `SHG001` / password `demo1234` |

Both login pages, plus the beneficiary login, also have a **Demo Login** button that fills and submits these automatically — intended for presentations/demos only; remove before a real production launch (and rotate/remove the seeded accounts).

## Deployment

**Backend + ML service → Render**, using the `render.yaml` Blueprint at the repo root:

1. In Render, "New +" → "Blueprint", point at this repo.
2. Render creates five services: `dhansetu-backend`, `dhansetu-ml`, and the three background workers (`dhansetu-scoring-worker`, `dhansetu-decision-worker`, `dhansetu-notification-worker`).
3. Fill in each service's env vars in the Render dashboard (`MONGODB_URI`, `ML_API_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, `FRONTEND_URL`, optionally the `BHASHINI_*` vars, and `RABBITMQ_URL` from a hosted broker like CloudAMQP) — set `ML_API_URL` to the `dhansetu-ml` service's public URL + `/predict`.
4. If you skip provisioning `RABBITMQ_URL` entirely, don't deploy the three worker services at all — the backend scores synchronously and there's nothing for them to consume.

**Frontend → Vercel**:

1. Import this repo into Vercel, set the project's **root directory to `frontend`**.
2. Vercel picks up `frontend/vercel.json` automatically (Vite build, SPA rewrites).
3. Set `VITE_API_URL` in Vercel's project env vars to the deployed backend's URL + `/api`.
4. Once you know the Vercel URL, set it as `FRONTEND_URL` on the Render backend and redeploy.
