import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_cors_vercel_preview():
    headers = {
        "Origin": "https://skilling-impact-intelligence-luwkdkmcc.vercel.app",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type"
    }
    response = client.options("/auth/login", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://skilling-impact-intelligence-luwkdkmcc.vercel.app"
    assert response.headers.get("access-control-allow-credentials") == "true"

def test_cors_vercel_production():
    headers = {
        "Origin": "https://skilling-impact-intelligence-n4eqipigg.vercel.app",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type"
    }
    response = client.options("/auth/login", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://skilling-impact-intelligence-n4eqipigg.vercel.app"

def test_cors_localhost():
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type"
    }
    response = client.options("/auth/login", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"

def test_cors_rejected_evil_example():
    headers = {
        "Origin": "https://evil-example.vercel.app",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type"
    }
    response = client.options("/auth/login", headers=headers)
    assert response.status_code == 400
    assert response.headers.get("access-control-allow-origin") is None

def test_cors_rejected_another_project():
    headers = {
        "Origin": "https://another-project.vercel.app",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type"
    }
    response = client.options("/auth/login", headers=headers)
    assert response.status_code == 400
    assert response.headers.get("access-control-allow-origin") is None
