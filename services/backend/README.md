# Local Backend

The backend is a local FastAPI service used by the AI Interview Copilot desktop application.

## Requirements

- Python 3.13 (recommended)

## Install dependencies

A virtual environment is recommended for dependency isolation. If you prefer not to use one, install dependencies for your Python 3.13 installation:

```powershell
py -3.13 -m pip install -r services/backend/requirements-dev.txt
```

## Run

From the repository root:

```powershell
py -3.13 -m uvicorn app.main:app --reload --app-dir services/backend --host 127.0.0.1 --port 8000
```

- API root: http://127.0.0.1:8000/
- Health check: http://127.0.0.1:8000/health
- Interactive API docs: http://127.0.0.1:8000/docs

The service binds to loopback only. Do not expose it on a network interface. Authentication for desktop-to-backend requests will be added before sensitive workflows are introduced.

## Interview session API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/sessions | Create a session with a title |
| GET | /api/sessions | List sessions with limit and offset |
| GET | /api/sessions/{session_id} | Retrieve one session |
| POST | /api/sessions/{session_id}/start | Start a created session |
| POST | /api/sessions/{session_id}/stop | Complete an active session |

Session states are created, active, and completed. Invalid lifecycle transitions return HTTP 409; unknown session IDs return HTTP 404.

## Local database

SQLite is created automatically on first session API use. By default, the database is stored at data/interview_copilot.db under the repository root; the data directory is excluded from Git. Set AI_INTERVIEW_DB_PATH to override the database location. The API stores session metadata only at this stage, not audio or transcripts.

## Run tests

From the repository root:

```powershell
py -3.13 -m pytest
```

## Current scope

Implemented: initial FastAPI endpoints, SQLite-backed interview session creation/list/retrieval/start/stop, and automated tests. Audio capture, transcription, document processing, settings persistence, desktop UI, and AI provider integrations remain planned work.
