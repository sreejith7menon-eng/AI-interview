# Development Roadmap

## Phase 0 — Preparation
- [x] Create private repository.
- [x] Define initial product scope.
- [x] Document requirements and architecture.
- [ ] Confirm repository visibility and branch settings.
- [ ] Create project board/issues from roadmap.
- [x] Verify target Windows/Python/Node toolchain.

## Phase 1 — Foundation
- [x] Add initial Electron + React + TypeScript application shell.
- [x] Add initial Python FastAPI service with root and health endpoints.
- [x] Establish a narrow typed Electron preload/IPC bridge for app and session operations.
- [ ] Add local WebSocket event protocol.
- [ ] Add versioned SQLite migrations and settings repository.
- [x] Add basic SQLite persistence for interview sessions.
- [ ] Add structured logging with secret/PII redaction.
- [x] Add backend endpoint and session lifecycle tests with local development instructions.
- [ ] Add CI, lint, and type-check workflows.

**Current status:** Initial Electron/React desktop shell and typed preload bridge are committed, with dashboard controls connected to the loopback FastAPI session API. Backend auto-launch, authenticated desktop/backend requests, versioned migrations, persistent settings, structured logging, and full CI remain pending.

**Exit criteria:** Desktop app starts, launches/stops local backend, reports health, and persists settings.

## Phase 2 — Audio proof of concept
- [ ] Enumerate audio devices.
- [ ] Capture system audio via WASAPI loopback.
- [ ] Capture microphone independently.
- [ ] Add input-level meters and visible capture indicator.
- [ ] Add emergency stop and bounded audio buffers.
- [ ] Test 30- and 60-minute capture stability.

**Exit criteria:** Both sources can be captured independently without blocking the UI or losing sustained audio.

## Phase 3 — Local transcription
- [ ] Integrate Whisper.cpp.
- [ ] Integrate VAD.
- [ ] Produce timestamped, source-labelled transcript segments.
- [ ] Add live transcript UI.
- [ ] Benchmark Base vs Small model on target hardware.
- [ ] Test offline transcription.

**Exit criteria:** A local recording can be transcribed and reviewed without network access.

## Phase 4 — Question and AI orchestration
- [ ] Add question detection and manual question selection.
- [ ] Define LLMProvider interface.
- [ ] Add Gemini adapter.
- [ ] Add secure API-key configuration.
- [ ] Add streamed responses, cancellation, timeout and quota handling.
- [ ] Add provider usage counters and request limits.
- [ ] Add local GGUF fallback adapter.

**Exit criteria:** A selected question can produce a streamed answer; quota/network failures are handled cleanly and never trigger paid billing.

## Phase 5 — Candidate context
- [ ] Add PDF/DOCX/TXT import.
- [ ] Parse documents locally.
- [ ] Create editable candidate profile.
- [ ] Add job-description analysis.
- [ ] Add local retrieval.
- [ ] Show selected context before external submission.
- [ ] Add sensitive-field exclusion.

**Exit criteria:** The response can use relevant candidate/job context without uploading full documents by default.

## Phase 6 — Desktop workflows and privacy
- [x] Add initial session lifecycle API and local session history storage.
- [x] Add initial dashboard session list/create/start/stop UI.
- [ ] Add full session history and review workflows.
- [ ] Add floating/compact session window.
- [ ] Add privacy mode and emergency hide/stop controls.
- [ ] Add clear capture status and notification privacy.
- [ ] Test supported Windows capture-exclusion behavior and document limitations.
- [ ] Add export and deletion controls.

**Exit criteria:** User can run and review a session with clear capture status and reliable data controls.

## Phase 7 — Advanced features
- [ ] Technical and coding response modes.
- [ ] Screenshot import and local OCR.
- [ ] Mock interview mode.
- [ ] Optional local TTS.
- [ ] Session analytics and improvement report.

## Phase 8 — Release readiness
- [ ] Package Windows installer.
- [ ] Test clean install, update, uninstall, and data retention.
- [ ] Test fully offline operation for local features.
- [ ] Test API quota exhaustion and network interruption.
- [ ] Security review of IPC, local service, secrets, and document parsing.
- [ ] Run 60-minute soak tests.
- [ ] Write user and developer documentation.

## Release gates

No phase is complete solely because the feature works once. Each phase requires automated tests where practical, a manual Windows acceptance checklist, and documented known limitations.
