# Local Setup Guide

Follow these instructions to run the Skilling Impact Intelligence platform locally on your machine.

## Prerequisites
- Node.js (v18 or higher)
- Python (v3.11 or higher)
- Git

## 1. Clone the Repository
```bash
git clone https://github.com/charan-builds/Skills---Management---SIH.git
cd Skills---Management---SIH
```

## 2. Backend Setup (FastAPI)
Open a terminal window and navigate to the `Backend` directory.

### Windows:
```bash
cd Backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 10000
```

### macOS/Linux:
```bash
cd Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 10000
```

You should see an output indicating `Uvicorn running on http://127.0.0.1:10000`. Leave this terminal running.

## 3. Frontend Setup (React/Vite)
Open a **new** terminal window and navigate to the `Frontend` directory.

```bash
cd Frontend
npm install
npm run dev
```

You should see an output indicating the Vite server is running (usually on `http://localhost:5173` or `5174`).

## 4. Environment Variables
The frontend is already pre-configured to look for the backend at `http://localhost:10000` during local development via the `.env.development` file. No manual configuration is required.

## 5. Accessing the Platform
- Open your browser and navigate to the localhost URL provided by the Vite terminal.
- Click the **Admin**, **Trainee**, or **Employer** buttons to instantly authenticate via the Demo Mode bypass.
