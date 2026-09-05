# Troubleshooting Guide

### 1. CORS Errors on Login

**Symptom**: When clicking a login role on the frontend, nothing happens. Opening the browser console reveals an error similar to: `Access to fetch at 'https://.../auth/login' from origin '...' has been blocked by CORS policy`.
**Cause**: The frontend URL you are accessing is not listed in the backend's allowed origins.
**Fix**: 
1. Open `Backend/app/main.py`.
2. Locate the `allow_origins` array in the `CORSMiddleware` configuration.
3. Add your specific frontend URL (e.g., `http://localhost:5173`) to the list.
4. Restart the Uvicorn server.

### 2. Dashboard Displays "Loading..." Indefinitely

**Symptom**: The Admin Dashboard spins endlessly and no KPIs load.
**Cause**: The frontend cannot establish a connection with the backend API.
**Fix**: 
1. Verify the backend server is actually running on port `10000`.
2. Check the browser Network tab. Look at the Request URL for `/api/analytics/dashboard`. If it says `localhost`, ensure your backend is running locally. If it says `render.com`, check if the Render instance has spun down (it takes ~30 seconds to wake up on the free tier). Refresh the page after 30 seconds.

### 3. Trainee Edits Do Not Persist

**Symptom**: You added a new trainee in the Admin portal, but after refreshing the page, they are gone.
**Cause**: This is the intended behavior of the current "Demo Mode" implementation. The API endpoints for POST/PUT requests simulate success but do not mutate the baseline JSON files on disk.
**Fix**: To make changes permanent, you must implement the `PostgresRepository` class (see `09_DATA_ARCHITECTURE.md`).

### 4. "Port In Use" Error During Frontend Startup

**Symptom**: Running `npm run dev` outputs `Port 5173 is in use, trying another one...` and starts on `5174`.
**Cause**: Another Vite process or Node server is still running in the background.
**Fix**: 
- **Windows**: Open Task Manager and end lingering `node.exe` processes.
- **Mac/Linux**: Run `lsof -i :5173` and `kill -9 <PID>`.
- **Alternative**: It is perfectly fine to let Vite use port `5174`. The backend CORS configuration allows `5174` and `5175` by default to accommodate this.
