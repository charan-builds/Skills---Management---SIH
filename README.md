# Skilling Impact Intelligence (SII)

> AI-powered workforce analytics platform connecting state skilling programmes, enterprise employers, and student trainees through longitudinal outcome tracking and predictive intelligence.

---

## 🏗️ Architecture

| Layer | Technology | Directory |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite 8 + React Router 7 | `Frontend/` |
| **Backend** | FastAPI (Python 3.11) | `Backend/` |
| **AI Core** | Gemini LLM + deterministic scoring engine | `ai/` |
| **Database** | Firebase Firestore (with demo-mode fallback) | `Backend/firebase/` |
| **Deployment** | Vercel (frontend SPA + serverless API) | `vercel.json` |

---

## 🎯 Three Portals

| Portal | Purpose | Demo Login |
| :--- | :--- | :--- |
| **Admin** | Programme analytics, skill-gap intelligence, employment outcomes, what-if policy simulator | `admin@sih.gov.in` / `admin123` |
| **Employer** | AI candidate matching, talent pool search, shortlisting, outreach, outcome verification | Org ID: `EMP-DEMO-001` / `demo123` |
| **Trainee** | Career readiness, explore jobs, improve skills (interactive quizzes), applications, profile | Trainee ID: `T102` / `demo123` |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **Python** v3.10+
- **Git**

### Backend
```bash
cd Backend
python -m venv venv
# Windows: .\venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```
Backend: http://localhost:8001 | Swagger Docs: http://localhost:8001/docs

### Frontend
```bash
cd Frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

---

## ⚙️ Environment Variables

### Frontend (`Frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8001
```

### Backend (`Backend/.env`)
```env
ENVIRONMENT=development
ENABLE_DEMO_MODE=true
CORS_ORIGINS=http://localhost:5173
# SECRET_KEY=required-only-when-ENVIRONMENT-is-production
# FIREBASE_SERVICE_ACCOUNT_PATH=firebase/credentials.json
```

See `Frontend/.env.example` and `Backend/.env.example` for complete templates.

---

## 🌐 Production Deployment

### Vercel (Monorepo)
1. Import repo into Vercel
2. Framework: **Vite**
3. Build command, output directory, and SPA rewrites are auto-configured via `vercel.json`
4. Set `VITE_API_BASE_URL` in Vercel environment settings

### Backend demo (Cloud Run / Railway / Render)
```bash
docker build -t sii-backend .
docker run --rm -p 8001:10000 sii-backend
```

The root image listens on port `10000` by default. To use a different internal
port, set both `PORT` and the container side of the `-p` mapping.

For a production datastore deployment, configure the host’s secret manager with
`ENVIRONMENT=production`, `ENABLE_DEMO_MODE=false`, a strong non-placeholder
`SECRET_KEY`, Firebase credentials (`FIREBASE_SERVICE_ACCOUNT_JSON` or a
mounted `firebase/credentials.json` file), and `CORS_ORIGINS` set to the exact
Vercel frontend URL. Set `VITE_ENABLE_DEMO_MODE=false` for the frontend build.

The bundled demo credentials are intentionally disabled outside demo mode.
Production users must sign in through a Firebase Web Authentication or SSO
client that supplies Firebase ID tokens with the required role claims.

---

## 📚 Documentation

| Document | Description |
| :--- | :--- |
| [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) | Step-by-step Vercel + backend deployment instructions |
| [`COMPLETE_FEATURE_REPORT.md`](COMPLETE_FEATURE_REPORT.md) | Full product feature matrix and architecture report |
| [`DEPLOYMENT_READINESS_REPORT.md`](DEPLOYMENT_READINESS_REPORT.md) | Build status, security audit, and deployment checklist |

---

## ⚡ Shortcuts (Windows)
- Double-click `Backend/start.bat` to launch backend
- Double-click `Frontend/start.bat` to launch frontend

---

## 📝 License
MIT
