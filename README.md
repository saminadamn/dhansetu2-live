# Dhansetu

A loan-eligibility and credit-scoring platform for beneficiaries, officers, and channel partners. Beneficiaries apply for loans via OTP-authenticated login; a Python ML service scores each application; officers review and approve/reject applications; channel partners bulk-import financial data via CSV.

## Architecture

- **`frontend/`** — React 19 + Vite + Tailwind. Multi-language UI (22 Indian languages via i18next).
- **`backend/`** — Node.js + Express 5 + MongoDB (Mongoose). Issues JWTs, orchestrates loan applications, calls the ML service.
- **`ml_model/`** — FastAPI + scikit-learn/XGBoost. Exposes `POST /predict`, called server-to-server by the backend (never directly by the frontend).

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
| `FAST2SMS_API_KEY` | no | sends real login OTP SMS via Fast2SMS. If unset, `sendOTP` falls back to a fixed test OTP (`123456`), logged to the server console — fine for demo/dev, not for real users. |
| `FRONTEND_URL` | yes | comma-separated allowed CORS origins |
| `BHASHINI_USER_ID` / `BHASHINI_API_KEY` | no | credentials from [bhashini.gov.in](https://bhashini.gov.in) for `POST /api/bhashini/translate`. If unset, that endpoint returns `503 { configured: false }` and the frontend keeps using its built-in i18next translations. |

### `frontend/.env`

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | yes | backend base URL including `/api` |

## Authentication model

- **Beneficiaries** log in via mobile number + SMS OTP (`POST /api/auth/send-otp`, `POST /api/auth/verify-otp`), receiving a JWT with `role: "beneficiary"`.
- **Officers** log in with employee ID + password (`POST /api/auth/officer-login`).
- **Channel partners** currently authenticate using officer credentials — there is no dedicated channel-partner login/role yet. If you need a separate channel-partner identity, add a `"channel"` role to `backend/src/models/User.js` and a matching login flow.
- All protected routes require `Authorization: Bearer <token>` and are role-gated via `authorizeRole` in `backend/src/middlewares/`.

Known limitation: a beneficiary's JWT is scoped by role only, not by Aadhaar number — the app never links a verified phone number to a specific Aadhaar identity. Anyone authenticated as a beneficiary can currently query loan/application history for any Aadhaar number they enter. The frontend works around this by remembering the Aadhaar used on the beneficiary's last loan application in `localStorage` (falling back to a manual "enter your Aadhaar" prompt on `/dashboard/beneficiary` otherwise) so "My Applications" has something to look up by — but this is not real authorization. Closing the gap for production requires deciding how Aadhaar gets bound to a verified identity (e.g. collected and locked in at first login) — a product decision, not just a wiring fix.

The Beneficiary Login page also has a **Demo Login** button that skips real OTP delivery via a pre-verified test account — intended for presentations/demos only; remove it before a real production launch.

## Deployment

**Backend + ML service → Render**, using the `render.yaml` Blueprint at the repo root:

1. In Render, "New +" → "Blueprint", point at this repo.
2. Render creates two services: `dhansetu-backend` and `dhansetu-ml`.
3. Fill in the backend's env vars (`MONGODB_URI`, `ML_API_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, `FAST2SMS_API_KEY`, `FRONTEND_URL`, optionally `BHASHINI_USER_ID`/`BHASHINI_API_KEY`) in the Render dashboard — set `ML_API_URL` to the `dhansetu-ml` service's public URL + `/predict`.

**Frontend → Vercel**:

1. Import this repo into Vercel, set the project's **root directory to `frontend`**.
2. Vercel picks up `frontend/vercel.json` automatically (Vite build, SPA rewrites).
3. Set `VITE_API_URL` in Vercel's project env vars to the deployed backend's URL + `/api`.
4. Once you know the Vercel URL, set it as `FRONTEND_URL` on the Render backend and redeploy.
