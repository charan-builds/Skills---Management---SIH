import pytest
import os
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_security_headers_production(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "production")
    response = client.get("/health")
    assert response.status_code == 200
    
    headers = response.headers
    assert "Strict-Transport-Security" in headers
    assert headers["Strict-Transport-Security"] == "max-age=31536000; includeSubDomains"
    assert "X-Content-Type-Options" in headers
    assert headers["X-Content-Type-Options"] == "nosniff"
    assert "X-Frame-Options" in headers
    assert headers["X-Frame-Options"] == "DENY"
    assert "Referrer-Policy" in headers
    assert headers["Referrer-Policy"] == "strict-origin-when-cross-origin"

def test_security_headers_non_production(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "development")
    response = client.get("/health")
    assert response.status_code == 200
    
    headers = response.headers
    assert "Strict-Transport-Security" not in headers
    assert "X-Content-Type-Options" in headers
    assert "X-Frame-Options" in headers
    assert "Referrer-Policy" in headers
