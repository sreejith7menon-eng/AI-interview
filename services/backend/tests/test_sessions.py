from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_session_lifecycle_and_persistence(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("AI_INTERVIEW_DB_PATH", str(tmp_path / "sessions.db"))

    created = client.post("/api/sessions", json={"title": "Backend Engineer Interview"})
    assert created.status_code == 201
    session = created.json()
    assert session["title"] == "Backend Engineer Interview"
    assert session["status"] == "created"
    assert session["started_at"] is None

    session_id = session["id"]
    started = client.post(f"/api/sessions/{session_id}/start")
    assert started.status_code == 200
    assert started.json()["status"] == "active"
    assert started.json()["started_at"] is not None

    fetched = client.get(f"/api/sessions/{session_id}")
    assert fetched.status_code == 200
    assert fetched.json()["status"] == "active"

    stopped = client.post(f"/api/sessions/{session_id}/stop")
    assert stopped.status_code == 200
    assert stopped.json()["status"] == "completed"
    assert stopped.json()["ended_at"] is not None

    listing = client.get("/api/sessions")
    assert listing.status_code == 200
    assert listing.json()["total"] == 1
    assert listing.json()["items"][0]["id"] == session_id


def test_missing_session_returns_404(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("AI_INTERVIEW_DB_PATH", str(tmp_path / "sessions.db"))

    response = client.get("/api/sessions/not-a-session")
    assert response.status_code == 404


def test_invalid_session_transitions_return_409(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("AI_INTERVIEW_DB_PATH", str(tmp_path / "sessions.db"))
    created = client.post("/api/sessions", json={"title": "Test"}).json()

    not_active = client.post(f"/api/sessions/{created['id']}/stop")
    assert not_active.status_code == 409

    completed = client.post(f"/api/sessions/{created['id']}/start")
    assert completed.status_code == 200
    stopped = client.post(f"/api/sessions/{created['id']}/stop")
    assert stopped.status_code == 200
    restarted = client.post(f"/api/sessions/{created['id']}/start")
    assert restarted.status_code == 409


def test_blank_session_title_is_rejected() -> None:
    response = client.post("/api/sessions", json={"title": "   "})
    assert response.status_code == 422
