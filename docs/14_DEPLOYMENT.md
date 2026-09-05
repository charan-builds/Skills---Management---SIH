# Deployment Guide

The Skilling Impact Intelligence platform is currently configured for a decoupled cloud deployment utilizing Vercel (Frontend) and Render (Backend).

## 1. Live Environment URLs

- **Production Frontend**: `https://skilling-impact-intelligence-n4eqipigg.vercel.app`
- **Production Backend**: `https://skilling-impact-intelligence-api.onrender.com`

---

## 2. Frontend Deployment (Vercel)

The React frontend is deployed as a static site via Vercel.

### Continuous Integration
- Vercel is directly linked to the GitHub repository.
- A push to the `main` branch triggers an automatic build using the `npm run build` command.
- The compiled `dist/` directory is then deployed globally across Vercel's Edge CDN.

### Environment Variables
The frontend requires the following environment variable to locate the production backend:
```env
VITE_API_URL=https://skilling-impact-intelligence-api.onrender.com
```
*(This is configured in the Vercel project settings).*

---

## 3. Backend Deployment (Render)

The FastAPI backend is containerized and deployed as a Web Service on Render.

### Docker Configuration
The backend relies on the `Backend/Dockerfile`.
```dockerfile
# Base image
FROM python:3.11-slim

# Working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port and run Uvicorn
EXPOSE 10000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
```

### Continuous Integration
- Render is linked to the GitHub repository and monitors the `Backend/` directory.
- Upon a push to `main`, Render pulls the latest code, builds a new Docker image based on the `Dockerfile`, and swaps out the container via a zero-downtime deployment strategy.

### CORS Configuration Requirement
If the frontend domain changes (e.g., deploying to a custom domain like `skilling.gov.in`), the backend's `main.py` CORS configuration MUST be updated and pushed to GitHub, otherwise the browser will block the frontend from accessing the Render API.

## 4. Local Development

To run the full stack locally for development:

**Terminal 1 (Backend):**
```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 10000
```

**Terminal 2 (Frontend):**
```bash
cd Frontend
npm install
npm run dev
```
*(The frontend will automatically point to `http://localhost:10000` via its `.env.development` configuration).*
