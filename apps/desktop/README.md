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

## Screen privacy protection

The dashboard includes a screen privacy control. It is enabled by default and persists in Electron's user-data directory. The Electron main process applies the preference with `BrowserWindow.setContentProtection()` to each app window.

This is an OS-level, best-effort capture-exclusion request, not a guarantee. Behavior varies by OS and capture method. Linux is reported as unsupported by this implementation. See [Screen privacy implementation and test checklist](../../docs/SCREEN-PRIVACY.md).

## Current scope

The desktop shell includes a dashboard, backend connectivity indicator, session creation/list/start/stop controls, and persisted screen-privacy preference. The backend must currently be started separately. Audio capture, transcription, provider integration, automatic backend lifecycle management, installer packaging, and subscription workflows remain future milestones.

The renderer has no direct Node.js access. It communicates through a narrow, typed, context-isolated preload bridge; backend requests are made by the Electron main process to the loopback-only FastAPI service.
