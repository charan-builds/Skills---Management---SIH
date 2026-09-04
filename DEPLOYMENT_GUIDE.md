# Skilling Impact Intelligence — Production Deployment Guide

## 1. Project Architecture Overview

The **Skilling Impact Intelligence System** is an enterprise workforce analytics and recruitment matching platform designed for state skilling directors, enterprise employers, and student trainees.

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│       Vercel / Production CDN / Static Cloud Host          │
│   • Admin Portal (/ /programmes /skill-gaps /outcomes)      │
│   • Employer Portal (/employer-dashboard /candidates)       │
│   • Trainee Portal (/trainee-dashboard /explore-jobs)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI Python)                  │
│            Cloud Run / AWS App Runner / VPS                 │
│   • Multi-role Authentication (/auth/login)                 │
│   • AI Matching & Gap Diagnostics Core                      │
│   • Candidate Discovery & Longitudinal Registry             │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│   Firebase Firestore / DB   │ │   Centralized Demo Matrix   │
│   (Persistent Cloud State)  │ │ (Deterministic Offline Seed)│
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. Frontend Deployment (Vercel)

### Option A: Monorepo Deployment (Deploying from Repository Root)
If importing the entire Git repository into Vercel:

1. **Framework Preset**: `Vite`
2. **Build Command**: `cd Frontend && npm install && npm run build` (Automatically read from root `vercel.json`)
3. **Output Directory**: `Frontend/dist`
4. **Root Directory**: `./`
5. **Environment Variables**:
   - `VITE_API_BASE_URL`: URL of your deployed FastAPI backend (e.g., `https://api.yourdomain.com`). If running a frontend-only demo with embedded fallbacks, you can set `VITE_API_BASE_URL` or leave it blank to utilize centralized deterministic demo intelligence.

### Option B: Dedicated Frontend Deployment (Root set to `Frontend`)
If setting the Vercel Root Directory to `Frontend`:

1. **Framework Preset**: `Vite`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Vercel Rewrite Configuration**: Included in `Frontend/vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
5. **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://api.yourdomain.com`

---

## 3. Backend Deployment (FastAPI)

The backend can be deployed to any containerized service (Google Cloud Run, AWS App Runner, Render, Railway, DigitalOcean App Platform):

### Docker Deployment
A production multi-stage `Dockerfile` is provided in the repository root. It
builds the React client and serves it with the FastAPI application:
```bash
docker build -t sii-backend .
docker run --rm -p 8001:10000 \
  -e CORS_ORIGINS=https://your-frontend.vercel.app \
  sii-backend
```

This starts the self-contained demo configuration. The image listens on port
`10000` by default. To use another internal port, set both `PORT` and the
container side of the `-p` mapping. For production, configure the environment
variables below in the deployment platform’s secret manager before deploying;
do not pass Firebase credentials or `SECRET_KEY` through a shell command.
`Backend/Dockerfile` is also available for an API-only image; build it with the
backend folder as the build context: `docker build -f Backend/Dockerfile -t sii-api Backend`.

### Environment Variables
Configure the following in your container / host environment:
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `ENVIRONMENT` | Deployment stage | `production` |
| `PORT` | Listening server port | `10000` |
| `CORS_ORIGINS` | Comma-separated exact frontend origins; no trailing slash | `https://your-frontend.vercel.app,http://localhost:5173` |
| `CORS_ALLOW_ORIGIN_REGEX` | Optional, narrowly scoped regex for owned preview domains | `https://your-project-[a-z0-9-]+\.vercel\.app` |
| `ENABLE_DEMO_MODE` | Use the bundled local dataset and prevent Firebase writes | `true` for demo; `false` for Firebase-backed production |
| `SECRET_KEY` | Required, non-placeholder signing secret when `ENVIRONMENT=production` | securely generated value |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase credentials JSON | `firebase/credentials.json` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Service account JSON supplied by a secret manager | optional alternative to a file |

### Production authentication

The bundled email/password and OTP-like sign-in experience is for demo mode
only. With `ENABLE_DEMO_MODE=false`, protected API routes accept Firebase ID
tokens and require role claims (`admin`, `employer`, or `trainee`; employers
also need an `organization_id` claim). Integrate Firebase Web Authentication or
your organization’s identity-provider client before exposing the bundled login
page in a production deployment.

---

## 4. Local Development Setup

### Backend
```bash
# 1. Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start FastAPI server
cd Backend
uvicorn app.main:app --port 8001 --reload
```

### Frontend
```bash
# 1. Install dependencies
cd Frontend
npm install

# 2. Start Vite development server
npm run dev
```

---

## 5. Demo Credentials & User Roles

| Portal | Role | Identifier / Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin Portal** | `admin` | `admin@sih.gov.in` | `admin123` |
| **Employer Portal** | `employer` | Org ID: `EMP-DEMO-001`<br/>Email: `recruitment@techflowsolutions.demo` | `demo123` |
| **Trainee Portal** | `trainee` | Trainee ID: `T102`<br/>Email: `priya.gupta@example.com` | `demo123` |

---

## 6. Pre-Deployment Verification Checklist

- [x] **Zero Hardcoded Localhost**: `Frontend/src/utils/config.js` routes through `VITE_API_BASE_URL`.
- [x] **SPA Route Rewrites**: Both root `vercel.json` and `Frontend/vercel.json` rewrite direct routes to `/index.html`.
- [x] **High-Contrast Theme**: Native dark OS schemes prevented via `color-scheme: light !important` in `index.css`.
- [x] **Defensive Data Handling**: All portals implement safe fallbacks to prevent white/blank screens.
- [x] **CORS Configuration**: Production browser origins are explicitly configured with `CORS_ORIGINS`; optional preview-domain regexes are opt-in.
- [x] **Production Bundle**: `npm run build` generates the client distribution in `dist/`.
- [ ] **Production Identity Provider**: Firebase Web Authentication / SSO sign-in and role-claim provisioning are configured for the deployed frontend.
