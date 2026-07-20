# Dhansetu

A loan-eligibility and credit-scoring platform for beneficiaries, loan officers, and channel partners (SHGs/NGOs/field agents). Built for SIH 2025.

[![Frontend](https://img.shields.io/badge/frontend-React%2019%20%2B%20Vite-blue)](https://github.com/saminadamn/dhansetu2-live)
[![Backend](https://img.shields.io/badge/backend-Node%20%2B%20Express%205-green)](https://github.com/saminadamn/dhansetu2-live)
[![ML Service](https://img.shields.io/badge/ml-FastAPI%20%2B%20scikit--learn-orange)](https://github.com/saminadamn/dhansetu2-live)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://dhansetu2-live.vercel.app)

## Overview

Beneficiaries apply for loans, officers review and approve them, and channel partners bulk-onboard applicant data. Every application is scored by a Python ML service that produces a composite credit score with SHAP-based explanations, so both the applicant and the reviewer can see *why* a score came out the way it did.

Scoring runs through an event-driven pipeline that degrades gracefully to synchronous scoring when no message broker is configured — the app works with zero extra infrastructure, and the pipeline is purely additive.

## Key Features

- **Multi-role access** — separate login flows for beneficiaries, officers, and channel partners, each with role-scoped JWTs and route guards on both frontend and backend.
- **Mobile-number login for beneficiaries** — no OTP/SMS step, to avoid a flaky SMS-delivery dependency.
- **Explainable scoring** — composite score, risk band, and a SHAP feature-impact breakdown shown to both the applicant and the reviewing officer.
- **Bulk onboarding** — channel partners upload a CSV of applicant financial data for cohort-level intake.
- **24-language UI** via i18next, plus an on-demand Bhashini translation widget and inline voice-to-text on the application form.
- **Async scoring pipeline** — RabbitMQ-backed workers with retries, exponential backoff, and a dead-letter queue; falls back to synchronous scoring if RabbitMQ isn't configured.
- **Observability** — structured JSON logs with a correlation ID that follows each application across every worker, plus Prometheus metrics on the backend, ML service, and each worker.
- **Aadhaar handling** — the raw number is never persisted; only a SHA-256 hash and last 4 digits are stored.

## Architecture

```
Frontend (React) → Backend (Express) → ML Service (FastAPI)
                          ↓
                      RabbitMQ (optional)
                          ↓
        Scoring Worker → Decision Worker → Notification Worker
```

- **`frontend/`** — React 19, Vite, Tailwind.
- **`backend/`** — Node.js, Express 5, MongoDB. Handles auth, applications, and calls the ML service.
- **`ml_model/`** — FastAPI, scikit-learn/XGBoost, SHAP. Exposes `POST /predict`, called only by the backend.

### Async scoring pipeline

`POST /api/loans/apply` creates the application immediately and returns `202` without waiting on the ML call. Three worker processes then carry it forward:

1. **Scoring worker** — calls the ML service, publishes the result.
2. **Decision worker** — persists the score and SHAP explanation, updates the application.
3. **Notification worker** — sends a status update (currently logs it; no SMS/email provider is wired up yet).

RabbitMQ was chosen over Kafka at this scale — a single lightweight broker with a mature Node client, rather than a JVM broker plus Zookeeper. If `RABBITMQ_URL` is unset or unreachable, the backend scores synchronously using the same persistence code the workers use — the pipeline is optional, not required.

Run workers locally with `npm run worker:scoring`, `worker:decision`, and `worker:notification` (each its own process, inside `backend/`).

### Observability

- **Structured logs** with a correlation ID that follows one application across every worker (`X-Correlation-Id` on HTTP, an AMQP message property in the queue).
- **Retries** — failed messages retry up to 5 times with exponential backoff (2s–32s), then land in a dead-letter queue instead of retrying forever.
- **Metrics** — `GET /metrics` on the backend and ML service (Prometheus format); each worker runs its own metrics endpoint (ports 9101–9103).
- Distributed tracing and a Grafana dashboard aren't included yet — both need a live deployment to be meaningful, and the metrics above are what a dashboard would query, so adding one later is config only.

## Repository Structure

```
frontend/     # React 19 + Vite + Tailwind
backend/
    src/
        workers/       # Scoring, decision, notification workers
        middlewares/    # Auth, role guards
        utils/           # Aadhaar hashing, demo account seeding
ml_model/     # FastAPI service, trained models, SHAP explainability
render.yaml   # Render Blueprint (backend, ML service, 3 workers)
```

## Local Setup

**1. ML service**
```bash
cd ml_model
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**2. Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in required values, see below
npm run dev
```

**3. Frontend**
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev
```

**4. Async pipeline (optional)** — the app works without this; skip it for synchronous scoring.
```bash
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```
Then, with `RABBITMQ_URL=amqp://localhost:5672` set in `backend/.env`, run each worker in its own terminal:
```bash
npm run worker:scoring
npm run worker:decision
npm run worker:notification
```
RabbitMQ's management UI is at `http://localhost:15672` (guest/guest).

## Environment Variables

**`backend/.env`**

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string |
| `ML_API_URL` | yes | URL to the ML service's `/predict` endpoint |
| `JWT_SECRET` | yes | signs login tokens |
| `GEMINI_API_KEY` | yes | powers OCR and speech-to-text |
| `FRONTEND_URL` | yes | comma-separated allowed CORS origins |
| `PORT` | no | defaults to 5000 |
| `RABBITMQ_URL` | no | enables the async pipeline; falls back to sync scoring if unset |
| `CLOUDINARY_URL` | no | enables document uploads on the loan form |
| `BHASHINI_*` | no | enables live translation; falls back to built-in i18next if unset |
| `LOG_LEVEL` | no | pino log level, defaults to `info` |
| `*_METRICS_PORT` | no | per-worker metrics port, defaults 9101–9103 |

**`frontend/.env`**

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | yes | backend base URL, including `/api` |

## Authentication

- Beneficiaries log in with a mobile number only — no OTP step. The account is created on first login.
- Officers and channel partners log in with an ID and password; accounts must be provisioned ahead of time (no self-signup).
- Aadhaar numbers are hashed (SHA-256) before storage; only the hash and last 4 digits are kept.

**Known limitation:** a beneficiary's JWT is scoped by role, not by Aadhaar number, so any authenticated beneficiary can currently look up application history for any Aadhaar number they enter. The frontend works around this by remembering the Aadhaar used on the last application, but this isn't real authorization — closing the gap requires deciding how Aadhaar gets bound to a verified identity at login.

**Demo accounts** are seeded automatically on server start:

| Role | Login | Credentials |
|---|---|---|
| Officer | `/login/officer` | `DEMO001` / `demo1234` |
| Channel partner | `/login/channel` | `SHG001` / `demo1234` |

Both, plus the beneficiary login, have a **Demo Login** button. Remove or rotate these before a production launch.

## Testing

There's no automated test suite yet — `npm test` in both `frontend/` and `backend/` is currently a placeholder. Natural next step: Jest for the Express controllers, pytest for the scoring logic, Vitest/Playwright for the frontend.

What has been verified manually, against real infrastructure:

- SHAP explainability against the actual trained models, via direct call and a live API request.
- The full async pipeline end-to-end (Docker RabbitMQ + MongoDB, all three workers).
- Failure handling — the ML service was killed mid-pipeline; retries hit the expected backoff delays and the message landed in the dead-letter queue after exhausting retries. Recovery was confirmed after restarting the ML service.
- All major frontend flows, checked directly in a browser.

## Deployment

- **Backend, ML service, and workers → Render**, via the `render.yaml` Blueprint (5 services: backend, ML service, and 3 workers).
- **Frontend → Vercel**, with the root directory set to `frontend/`.
- A RabbitMQ instance (e.g. a free CloudAMQP plan) is only needed if you want the async pipeline; otherwise skip it and don't deploy the worker services.

Full step-by-step deployment instructions, including which env vars go on which service, are documented in the deployment section of the previous README revision — happy to split this into `docs/DEPLOYMENT.md` if you'd like.

## Roadmap

- Real SMS/email delivery in the notification worker
- Aadhaar-bound identity verification at login
- Distributed tracing and a Grafana dashboard

## License

TBD.
