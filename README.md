# Dhansetu

A loan-eligibility and credit-scoring platform for three roles — **beneficiaries** (citizens applying for loans), **officers** (reviewing/approving applications), and **channel partners** (SHGs/NGOs/field agents bulk-importing applicant data). A Python ML service scores each application on a composite credit score with real SHAP-based explainability; scoring runs through an event-driven pipeline that degrades gracefully to synchronous processing when no message broker is available.

## Feature overview

- **Landing page** — government-portal styling, dark/light theme (fully restyled, not just a page-background toggle), 24-language UI (`frontend/src/language22/`, via i18next; includes 22 of India's scheduled languages plus English and Bodo).
- **Beneficiary**: logs in with just a mobile number (no OTP/SMS step) → multi-step loan application (inline voice-to-text mic icon on each field, an Account Aggregator consent checkbox gating submission, an on-demand Bhashini translation widget) → redirected to **My Applications** (list of past/current applications with status + risk-band badges) → click into any application for its **status detail page** (composite score gauge, risk band, SHAP feature-impact chart with plain-English insights).
- **Officer**: logs in with employee ID + password → dashboard with **Pending / Approved / Denied / Repeated Users** queue tabs and a sort control (date, composite score, income proxy) → per-application review screen (same score gauge + SHAP panel as the beneficiary view) → Approve / Reject / Ask Clarification.
- **Channel partner**: logs in the same way as an officer, at a separate role — bulk-uploads a CSV of applicant financial data for mass onboarding (e.g. SHG cohorts).
- **Demo Login** buttons on all three login pages, driving the real login endpoints against a mobile number / seeded demo account — for fast walkthroughs, not for production.

## Architecture

- **`frontend/`** — React 19 + Vite + Tailwind.
- **`backend/`** — Node.js + Express 5 + MongoDB (Mongoose). Issues JWTs, orchestrates loan applications, calls the ML service.
- **`ml_model/`** — FastAPI + scikit-learn/XGBoost + SHAP. Exposes `POST /predict`, called server-to-server by the backend (never directly by the frontend).

### Asynchronous scoring pipeline

```
Client → API Gateway (Express) → RabbitMQ → Scoring Worker → Decision Worker → Notification Worker → MongoDB
```

`POST /api/loans/apply` creates the `LoanApplication` record immediately (status `PENDING`, no score yet) and publishes an `application.submitted` event, returning `202` right away — the request never blocks on the ML call. Three independent worker processes (`backend/src/workers/`) then carry it the rest of the way:

1. **Scoring Worker** consumes `application.submitted`, calls the ML service's `/predict`, and publishes `application.scored`.
2. **Decision Worker** consumes `application.scored`, persists the `Score` document (including the SHAP explanation) and attaches it to the `LoanApplication`, and publishes `application.decided`.
3. **Notification Worker** consumes `application.decided` and sends (currently: logs — no SMS/email provider is wired up yet, see the code comment in `notification.worker.js`) a status update to the applicant.

**Why RabbitMQ, not Kafka**: both would work, but Kafka needs a JVM broker (plus Zookeeper or KRaft mode) — a lot of operational weight for a workload this size. RabbitMQ is a single lightweight service with a mature Node client (`amqplib`) and free hosted options (e.g. [CloudAMQP](https://www.cloudamqp.com/)), which is what `render.yaml` assumes since Render itself doesn't offer a managed broker.

**Graceful fallback, by design**: if `RABBITMQ_URL` isn't set (or the broker is unreachable), `applyForLoan` scores synchronously in-request instead — the exact same persistence code (`scoring.service.js`) that the Decision Worker uses, just called inline. The app works end-to-end with zero extra infrastructure; RabbitMQ is additive, never required.

Run the workers locally with `npm run worker:scoring`, `npm run worker:decision`, `npm run worker:notification` (each in `backend/`, each its own process/terminal).

### Observability

- **Structured logging** — every backend/worker log line is JSON (pretty-printed in dev via `pino-pretty`) via `backend/src/config/logger.js`. Every HTTP request gets a correlation ID (`req.correlationId`, echoed back as the `X-Correlation-Id` response header) that also rides along as the AMQP message's `correlationId` property through the whole pipeline — grep any worker's logs for one ID and see that single application's entire journey across all three workers.
- **Retries with exponential backoff + dead-letter queue** — `eventBus.js` implements the standard RabbitMQ "TTL + DLX" delayed-retry pattern: a failed message retries up to 5 times (2s, 4s, 8s, 16s, 32s delays) via a per-queue `<queue>.retry` holding queue, then gets routed to `<queue>.dlq` for manual inspection instead of retrying forever or being silently dropped.
- **Prometheus metrics** — `GET /metrics` on the backend (`http_requests_total`, `http_request_duration_seconds`, `events_published_total`, plus default Node process metrics) and on the ML service (via `prometheus-fastapi-instrumentator`). Each worker, having no HTTP server of its own, runs a tiny dedicated one just for `/metrics` (ports `9101`/`9102`/`9103` for scoring/decision/notification respectively, overridable via `SCORING_METRICS_PORT`/`DECISION_METRICS_PORT`/`NOTIFICATION_METRICS_PORT`), exposing `events_processed_total{queue,outcome}` (`success`/`retry`/`dead_letter`) and `worker_processing_duration_seconds`. Point a Grafana instance at any of these — no code changes needed, just a Prometheus scrape config.
- **Not included, on purpose**: OpenTelemetry distributed tracing and a Grafana dashboard file. Both need a deployed backend (a trace collector, a running Grafana server) to show anything real — without one they'd be unverifiable config, not a working feature. The metrics above are exactly what a Grafana dashboard would query, so adding one later is config-only.

## Testing & verification

**There is no automated test suite** — no Jest/Vitest/pytest files exist in this repo (`npm test` in either `backend/` or `frontend/` is a placeholder). Adding one is the natural next step if you want CI-enforced regression protection; candidates would be Jest for the Express controllers, pytest for `score_prediction.py`, and Vitest/Playwright for the frontend.

What *has* been verified, hands-on, with real infrastructure (not just read through):

- SHAP explainability against the actual trained `.pkl` models (not mocked data) — direct Python call and a live `curl` against the running FastAPI endpoint.
- The full async pipeline end-to-end: real Docker RabbitMQ + MongoDB, all three workers, a submitted application flowing scoring → decision → notification and landing in MongoDB with its SHAP explanation attached.
- Failure handling: the ML service was killed mid-pipeline, the scoring worker was confirmed retrying at the exact expected exponential-backoff delays (2/4/8/16/32s) with the same correlation ID on every attempt, and the message was confirmed landing in the dead-letter queue via RabbitMQ's management API after all retries were exhausted. Prometheus counters were checked and matched exactly (5 `retry` + 1 `dead_letter`).
- Recovery: the ML service was restarted and a fresh application was confirmed scoring normally again.
- Frontend: landing page, header contrast, dark-mode restyling, the application form (i18n leak fix, inline mic icon, consent checkbox), all three login pages plus their demo-login buttons, the officer dashboard's queue tabs/sort/repeated-users view, and route-guard redirects for unauthenticated visits — all checked directly in a browser.

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

### 4. (Optional) Async pipeline locally

Skip this entirely and the app still works — `applyForLoan` scores synchronously without it.

```bash
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Then, each in its own terminal (inside `backend/`), with `RABBITMQ_URL=amqp://localhost:5672` set in `.env`:

```bash
npm run worker:scoring
npm run worker:decision
npm run worker:notification
```

The RabbitMQ management UI is at `http://localhost:15672` (guest/guest) if you want to watch queues/messages directly.

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
| `CLOUDINARY_URL` | no | from your [Cloudinary](https://cloudinary.com) dashboard (`cloudinary://key:secret@cloud_name`). Enables `POST /api/uploads/document` — the loan form uploads attached documents (electricity bill, income certificate, business proof) and stores their hosted URLs on the application, visible as links in the officer's review screen. If unset, the form submits without attachments. |
| `LOG_LEVEL` | no | pino log level (`info` default) — set `debug` for verbose output |
| `SCORING_METRICS_PORT` / `DECISION_METRICS_PORT` / `NOTIFICATION_METRICS_PORT` | no | port each worker's `/metrics` server listens on (defaults `9101`/`9102`/`9103`) |

### `frontend/.env`

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | yes | backend base URL including `/api` |

## Authentication model

- **Beneficiaries** log in with just a mobile number (`POST /api/auth/beneficiary-login`) — **no OTP/SMS step**. This was deliberately removed (it originally required Fast2SMS and repeatedly broke: real SMS delivery to test numbers, a demo-bypass button that didn't actually bypass anything) in favor of a single-step login. The account is created on first login; receives a JWT with `role: "beneficiary"`.
- **Officers** log in with employee ID + password (`POST /api/auth/officer-login`).
- **Channel partners** (SHGs/NGOs/field agents) log in the same way, at `/login/channel` — same endpoint as officers, but their account's `role` field is `"channel"`, which is what the issued JWT is scoped to. (Previously `/dashboard/channel` had no login at all — anyone could reach it directly.)
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

## Deployment — hosting it live

### Backend + ML service + workers → Render, via `render.yaml`

The Blueprint at the repo root defines five services: `dhansetu-backend` (web), `dhansetu-ml` (web), and three background workers (`dhansetu-scoring-worker`, `dhansetu-decision-worker`, `dhansetu-notification-worker`).

1. **(Optional, for the async pipeline) Create a RabbitMQ instance first** — e.g. a free [CloudAMQP](https://www.cloudamqp.com/) "Little Lemur" plan. Copy its AMQP URL; you'll paste it into every service below as `RABBITMQ_URL`. Skip this step entirely if you're fine with synchronous scoring — see the fallback behavior above.
2. In the Render dashboard: **New +** → **Blueprint**, point it at this repo/branch. Render reads `render.yaml` and creates all five services.
3. **If you skipped step 1**, delete/don't deploy the three worker services — there's nothing for them to consume, and the backend already falls back to scoring synchronously.
4. Fill in each service's env vars in the Render dashboard (values aren't synced between services automatically — `sync: false` in the Blueprint means you set each one by hand):
   - `dhansetu-backend`: `MONGODB_URI`, `ML_API_URL` (see step 6), `JWT_SECRET` (any long random string), `GEMINI_API_KEY`, `FRONTEND_URL` (see step 8), optionally the four `BHASHINI_*` vars, optionally `RABBITMQ_URL`.
   - `dhansetu-scoring-worker`: `MONGODB_URI`, `ML_API_URL`, `RABBITMQ_URL`.
   - `dhansetu-decision-worker`: `MONGODB_URI`, `RABBITMQ_URL`.
   - `dhansetu-notification-worker`: `RABBITMQ_URL`.
5. `MONGODB_URI` — use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster if you don't already have one; the same connection string goes on the backend and both DB-touching workers.
6. Once `dhansetu-ml` finishes deploying, copy its public Render URL and set `ML_API_URL` on `dhansetu-backend` and `dhansetu-scoring-worker` (the only two that call it) to `<that-url>/predict`.
7. Deploy (or redeploy) all five services once every env var above is filled in.
8. **Frontend → Vercel**:
   - Import this repo into Vercel, set the project's **root directory to `frontend`**.
   - Vercel picks up `frontend/vercel.json` automatically (Vite build, SPA rewrites) — no manual build config needed.
   - Set `VITE_API_URL` in Vercel's project env vars to `<dhansetu-backend's Render URL>/api`, then deploy.
9. Once you have the Vercel URL, set it as `FRONTEND_URL` on `dhansetu-backend` in Render and redeploy that one service — this is what CORS checks against, so the frontend can't reach the API until it's set correctly.
10. Sanity-check the live deployment: open the Vercel URL, use the **Demo Login** button on `/login/beneficiary`, submit a loan application, and confirm it shows up under "My Applications" (scored either instantly, if synchronous, or within a few seconds if the async pipeline is wired up).
