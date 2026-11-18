# AI Interview Copilot

A Windows-first desktop AI assistant for interview preparation and permitted meeting workflows. The product combines live transcription, question understanding, candidate context, suggested answers, and privacy-conscious desktop controls.

This repository is evolving from a personal prototype into a commercial product. The initial release remains local-first: the desktop app and local services run on the user's computer, while optional AI providers can be configured separately.

## Product direction

- **Live conversation support:** separate microphone and system-audio streams, timestamped transcription, question detection, and suggested responses.
- **Candidate context:** local resume and job-description library with user-approved context retrieval.
- **Technical assistance:** explanations, coding approaches, system-design guidance, and screenshot/OCR workflows in later milestones.
- **Privacy controls:** explicit capture indicators, emergency stop, local data controls, and best-effort operating-system screen-capture exclusion for the app's own windows.
- **Provider flexibility:** Gemini first, with additional cloud and local-model adapters planned.
- **Commercial model:** free and paid subscriptions, with a bring-your-own-key/local option under consideration. Pricing, quotas, and billing will be finalized after usage-cost testing.

## Important privacy limitation

The screen privacy setting uses Electron's `BrowserWindow.setContentProtection()` API to request OS-level capture exclusion for this app's windows. It is enabled by default and can be changed in the desktop UI. It is **best-effort, not guaranteed**: results depend on the operating system, capture API, and screen-sharing application. Linux does not provide equivalent support in this implementation.

This feature is intended to reduce accidental disclosure of private app content. It must not be used to bypass interview rules, proctoring, employer monitoring, or participant expectations. The app does not promise invisibility or undetectability. See [Screen-sharing privacy](docs/SCREEN-PRIVACY.md).

## Current technology

- Desktop: Electron, React, TypeScript
- Local service: Python, FastAPI
- Storage: SQLite and local files
- Planned audio: Windows WASAPI loopback and microphone capture
- Planned speech-to-text: Whisper.cpp with VAD
- AI: provider adapter (Gemini first), optional additional providers and local GGUF runtime
- Packaging: Electron Builder (planned)

## Repository layout

```text
apps/desktop/       Electron + React + TypeScript desktop shell
services/backend/   FastAPI local service and session API
services/audio/     Audio capture and preprocessing (planned)
services/speech/    VAD and transcription (planned)
services/ai/        Provider adapters and prompt orchestration (planned)
services/documents/ Resume and job-description parsing (planned)
services/context/   Local retrieval and conversation context (planned)
docs/               Product, architecture, privacy, and roadmap documents
```

## Development status

**Implemented:** initial Electron + React desktop shell, restricted context-isolated preload bridge, FastAPI session API, local SQLite session metadata, and a persisted screen-capture privacy preference. The desktop UI exposes the privacy setting and platform limitation message.

**Not yet implemented:** actual audio capture, transcription, AI provider calls, document parsing, screen analysis, subscription accounts, payment processing, installer packaging, and automated release pipeline. The privacy API is wired into the desktop shell but still requires Windows/macOS capture-path acceptance testing.

## Getting started

See:
- [Desktop setup](apps/desktop/README.md)
- [Backend setup](services/backend/README.md)
- [Requirements](docs/REQUIREMENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)

## Security

Never commit API keys, credentials, resumes, interview recordings, transcripts, local databases, or personal data. Use `.env.example` as a template only. Packaged Windows credentials should use Windows Credential Manager or an equivalent secure store. Keep the local backend bound to loopback and keep renderer access behind the restricted preload bridge.

## Licensing and third-party components

No open-source licence has been selected for this repository; all rights remain reserved by the repository owner unless a licence is added. Any third-party code, native binaries, speech models, and AI models must be reviewed individually for commercial-use permissions and redistribution obligations before inclusion in a paid product. Do not assume that a model's licence matches the software wrapper's licence.
