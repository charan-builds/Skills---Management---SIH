# ==========================================
# STAGE 1: Build React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/Frontend

COPY Frontend/package*.json ./
RUN npm install

COPY Frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Python Backend & Static Server
# ==========================================
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=10000

# Install build dependencies and curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY Backend/requirements.txt ./Backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./Backend/requirements.txt

# Copy Backend source code and assets
COPY Backend/ ./Backend/

# Copy built React frontend assets from Stage 1
COPY --from=frontend-builder /app/Frontend/dist ./Frontend/dist

# Run as non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser
WORKDIR /app/Backend

EXPOSE 10000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000} --proxy-headers --forwarded-allow-ips='*'"]
