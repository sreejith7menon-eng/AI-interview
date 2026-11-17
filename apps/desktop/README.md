# Desktop application

Electron + React + TypeScript desktop shell for AI Interview Copilot.

## Requirements

- Node.js 20.19+ and npm
- Python 3.13 for the local FastAPI backend

## Install

From the repository root:

```powershell
cd apps/desktop
npm install
```

## Run in development

Start the backend in a separate terminal from the repository root:

```powershell
py -3.13 -m uvicorn app.main:app --reload --app-dir services/backend --host 127.0.0.1 --port 8000
```

Then start the desktop application:

```powershell
cd apps/desktop
npm run dev
```

## Validate

```powershell
npm run typecheck
npm run build
```

The initial desktop shell includes a dashboard, backend connectivity indicator, and session creation/list/start/stop controls connected to the local API. The backend must currently be started separately. Automatic backend lifecycle management, installer packaging, and the remaining desktop workflows are later milestones.

The renderer has no direct Node.js access. It communicates through a narrow context-isolated preload bridge; backend requests are made by the Electron main process to the loopback-only FastAPI service.
