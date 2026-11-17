from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root_returns_application_information() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "application": "AI Interview Copilot",
        "message": "Backend is running.",
        "version": "0.1.0",
    }


def test_health_returns_healthy_status() -> None:
    response = client.get("/health")
    payload = response.json()

    assert response.status_code == 200
    assert payload["status"] == "healthy"
    assert payload["service"] == "ai-interview-backend"
    assert "timestamp" in payload
