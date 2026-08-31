# Temporary Ngrok Demo & Remote Team Presentation Guide

This guide describes how to expose the complete **Skilling Impact Intelligence** prototype over the internet using `ngrok` for remote team collaboration, live demonstrations, and stakeholder reviews.

---

## 1. Prerequisites

1. **Python 3.10+** (for FastAPI backend)
2. **Node.js 18+** & **npm** (for React/Vite frontend)
3. **ngrok CLI** installed on your system (Download from [ngrok.com/download](https://ngrok.com/download) or install via `winget install ngrok.ngrok` / `brew install ngrok`)

> **IMPORTANT**: Ngrok URLs change dynamically each time you start an ngrok session. The application uses environment-based configuration (`VITE_API_BASE` in `Frontend/.env`) so that no temporary URLs are ever hardcoded into source code.

---

## 2. Step-by-Step 4-Terminal Startup Workflow

### Terminal 1: Start Backend (FastAPI)
```bash
cd Backend
# Activate virtual environment if configured:
# Windows: .\venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

uvicorn app.main:app --port 8001 --reload
```
*Backend runs locally at `http://localhost:8001`.*

---

### Terminal 2: Expose Backend via Ngrok
```bash
ngrok http 8001
```
*Copy the generated forwarding URL (e.g. `https://a1b2-c3d4.ngrok-free.app`).*

---

### Terminal 3: Configure Frontend Environment & Start Vite
Open `Frontend/.env` and update `VITE_API_BASE` with your **Backend Ngrok URL**:

```env
VITE_API_BASE=https://a1b2-c3d4.ngrok-free.app
VITE_API_BASE_URL=https://a1b2-c3d4.ngrok-free.app
```

Then start the frontend:
```bash
cd Frontend
npm run dev
```
*Frontend runs locally at `http://localhost:5173`.*

---

### Terminal 4: Expose Frontend via Ngrok
```bash
ngrok http 5173
```
*Copy the generated frontend forwarding URL (e.g. `https://x9y8-z7w6.ngrok-free.app`).*  
**Share this Frontend Ngrok URL with your teammate or demo audience!**

---

## 3. How the Network Architecture Works

```
Teammate / Judge Browser
         │
         ▼ (Public HTTPS)
Frontend Ngrok Tunnel (https://x9y8-z7w6.ngrok-free.app)
         │
         ▼ (Local Port Forward)
Vite Dev Server (localhost:5173)
         │
         ▼ (API Requests to VITE_API_BASE)
Backend Ngrok Tunnel (https://a1b2-c3d4.ngrok-free.app)
         │
         ▼ (Local Port Forward)
FastAPI Backend (localhost:8001)
         │
         ▼
Centralized Demo Data Matrix / AI Diagnostic Engine
```

---

## 4. Automatic Header & CORS Configuration

1. **Ngrok Free-Tier Interstitial Bypass**:
   The frontend utilities (`authFetch.js` and `Login.jsx`) automatically include the header:
   `"ngrok-skip-browser-warning": "true"`
   This prevents ngrok from serving an HTML interstitial warning page instead of API JSON.

2. **Dynamic CORS Support**:
   FastAPI in `Backend/app/main.py` is pre-configured with a dynamic origin regex:
   `r"https://.*(\.vercel\.app|\.ngrok-free\.app|\.ngrok\.app|\.ngrok\.io)"`
   This automatically accepts requests from any ngrok tunnel origin while preserving `Authorization` Bearer credentials and preflight `OPTIONS` requests.

3. **Vite Host Whitelist**:
   `Frontend/vite.config.js` is configured with `server: { host: true, allowedHosts: true }` to eliminate "Blocked Host" errors when accessed through external tunnels.

---

## 5. Demo Credentials & Presentation Walkthrough

### 👑 Admin Portal Demo Flow
- **URL**: Open your Frontend Ngrok URL and select the **Admin** tab.
- **Credentials**: `admin@sih.gov.in` / `admin123`
- **What to Demonstrate**:
  1. **Executive Dashboard (`/`)**: 10 real-time KPIs, 8-stage Trainee Progression Funnel, AI Programme Insights, and instant CSV report export.
  2. **Skill Gap Intelligence (`/skill-gaps`)**: Horizontal demand-vs-supply bar charts, 3-way gap matrix table, skill detail modal, and one-click training recommendation adoption.
  3. **Programme Performance (`/programmes`)**: Card grid, table view, side-by-side 3-way comparison matrix, and longitudinal 6-stage impact chains (`/programmes/P001`).
  4. **Employment Outcomes (`/outcomes`)**: Placement rate breakdown and interactive verification modal.
  5. **What-If Simulator (`/interventions`)**: Simulate curriculum changes with estimated ROI.

---

### 🏢 Organisation / Employer Portal Demo Flow
- **URL**: Select the **Employer** tab on the login page.
- **Credentials**: Org ID: `EMP-DEMO-001` / Email: `recruitment@techflowsolutions.demo` / Password: `demo123`
- **What to Demonstrate**:
  1. **Employer Dashboard (`/employer-dashboard`)**: Active vacancies, qualified candidates, recruitment funnel, and workforce skill intelligence.
  2. **Candidate Talent Pool (`/employer/candidates`)**: Multi-filter candidate discovery, verified skill chips, and interactive outreach composer modal.
  3. **Candidate Diagnostic (`/employer/candidates/T102`)**: 2-column fit breakdown with resume modal and skill analysis.
  4. **Verify Outcomes (`/employer/verify-outcomes`)**: Review hired trainees and submit 3M/6M/12M retention checkpoints.
  5. **Enterprise Integrations (`/employer/integrations`)**: ATS, HRIS, and State Job Gateway connector management.

---

### 🎓 Trainee Portal Demo Flow
- **URL**: Select the **Trainee** tab on the login page.
- **Credentials**: Trainee ID: `T102` / Email: `priya.gupta@example.com` / Password: `demo123`
- **What to Demonstrate**:
  1. **Trainee Overview (`/trainee-dashboard/T102`)**: 88% Career Readiness score for target role (*Cybersecurity Analyst*), 3-way skill match breakdown.
  2. **Explore Jobs (`/trainee/jobs`)**: Curated enterprise roles with calculated Match %, salary ranges, and 1-click application modal.
  3. **Improve Skills (`/trainee/skills`)**: 4 AI growth pathways and interactive 3-question adaptive micro-assessment.
  4. **My Applications (`/trainee/applications`)**: 5-stage live application tracker.
  5. **Profile & Settings (`/trainee/profile`)**: 85% profile completeness meter with editable skills, degree, and work history.

---

## 6. Troubleshooting Common Issues

| Symptom | Probable Cause | Resolution |
| :--- | :--- | :--- |
| **"Network Error" or Failed fetch on login** | Frontend still pointing to `localhost` or old ngrok URL | Update `VITE_API_BASE` in `Frontend/.env` with current backend ngrok URL and restart `npm run dev`. |
| **"Blocked host: xyz.ngrok-free.app"** | Vite host security check | Ensure `server: { host: true, allowedHosts: true }` is in `Frontend/vite.config.js`. |
| **Ngrok warning page in browser** | Free-tier ngrok interstitial | Teammate can click "Visit Site" once on the frontend URL. API calls automatically include `ngrok-skip-browser-warning: true`. |
| **CORS preflight error** | Frontend tunnel URL not recognized | Verify `Backend/app/main.py` has the ngrok regex enabled. |

---

## 7. How to Stop the Demo

1. Press `Ctrl + C` in each terminal window.
2. In `Frontend/.env`, reset `VITE_API_BASE` back to `http://localhost:8001` for standard local development.
