# Local Backend

The backend is a local FastAPI service used by the AI Interview Copilot desktop application.

## Requirements

- Python 3.13 (recommended for the current development environment)

## Setup from the repository root

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r services/backend/requirements-dev.txt
```

## Run

From the repository root, with the virtual environment activated:

```powershell
uvicorn app.main:app --reload --app-dir services/backend --host 127.0.0.1 --port 8000
```

- API root: http://127.0.0.1:8000/
- Health check: http://127.0.0.1:8000/health
- Interactive API docs: http://127.0.0.1:8000/docs

The service binds to loopback only. Do not expose it on a network interface. Authentication for desktop-to-backend requests will be added before sensitive workflows are introduced.

## Run tests

From the repository root:

```powershell
pytest services/backend/tests
```

## Current scope

This is the initial API foundation only. Session persistence, audio capture, transcription, document processing, and AI provider integrations are planned subsequent milestones.
