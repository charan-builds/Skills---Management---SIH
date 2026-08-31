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
A production `Dockerfile` is provided in the repository root:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
WORKDIR /app/Backend
EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Environment Variables
Configure the following in your container / host environment:
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `ENVIRONMENT` | Deployment stage | `production` |
| `PORT` | Listening server port | `8001` |
| `HOST` | Listening interface | `0.0.0.0` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `https://your-frontend.vercel.app,http://localhost:5173` |
| `ENABLE_DEMO_MODE` | Ensures fallback resilience when external DB is offline | `true` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase credentials JSON | `firebase/service-account.json` |

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
- [x] **CORS Configuration**: FastAPI allows production domains and Vercel preview domains via regex.
- [x] **Production Bundle**: `npm run build` generates optimized, error-free client distribution in `dist/`.
