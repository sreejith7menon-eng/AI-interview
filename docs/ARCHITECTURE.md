# Technical Architecture — AI Interview Copilot

## 1. Architectural principles

- Local-first processing with optional cloud inference.
- Modular adapters for audio, ASR, LLM providers, storage, and document parsing.
- UI must never call AI providers directly.
- Audio capture must remain independent from ASR and LLM latency.
- All external data transmission must be minimized and user-configurable.

## 2. High-level components

```text
┌───────────────────────────────────────────────────────────┐
│ Windows Desktop — Electron + React + TypeScript            │
│ Dashboard | Session UI | Settings | Privacy indicators      │
└─────────────────────────────┬─────────────────────────────┘
                              │ localhost IPC / HTTP + WS
┌─────────────────────────────▼─────────────────────────────┐
│ Local Backend — Python + FastAPI                            │
│ Session orchestration | bounded queues | event streaming    │
└───────────────┬──────────────────────────┬─────────────────┘
                │                          │
┌───────────────▼────────────┐  ┌──────────▼────────────────┐
│ Audio service              │  │ Context/document service  │
│ WASAPI loopback + mic      │  │ PDF/DOCX parsing          │
│ device selection          │  │ candidate profile         │
│ audio buffers              │  │ local retrieval           │
└───────────────┬────────────┘  └──────────┬────────────────┘
                │                          │
┌───────────────▼────────────┐  ┌──────────▼────────────────┐
│ Speech service             │  │ AI orchestration          │
│ VAD + Whisper.cpp          │  │ question detection        │
│ timestamped segments       │  │ provider adapters         │
│ source-labelled transcript │  │ prompt/context assembly   │
└───────────────┬────────────┘  └──────────┬────────────────┘
                │                          │
                └──────────────┬───────────┘
                               │
                 ┌─────────────▼─────────────┐
                 │ Local SQLite + file store │
                 │ sessions, settings, docs  │
                 └───────────────────────────┘
```

## 3. Desktop and backend boundary

- Electron main process owns window lifecycle and native desktop capabilities.
- React renderer handles presentation only.
- Preload exposes a narrow, typed API; do not expose unrestricted Node APIs to the renderer.
- Python FastAPI runs as a child process bound to 127.0.0.1.
- Use authenticated local IPC or a per-launch random local token for backend communication.
- WebSocket events carry transcript updates, capture state, provider state, and streamed answer chunks.
- Validate all IPC and HTTP inputs.

## 4. Audio subsystem

Define an AudioCaptureAdapter interface with:
- enumerate_devices()
- start_system_loopback(device_id)
- start_microphone(device_id)
- stop()
- audio events carrying source, sample rate, channels, and monotonic timestamp.

Implementation options should be benchmarked on Windows: native WASAPI via a small C#/NAudio helper, or a Python library that reliably exposes loopback capture. Do not assume microphone capture and loopback capture share the same device path.

Use bounded ring buffers and separate worker queues. Audio capture must not block on ASR, database writes, or LLM calls.

## 5. Speech subsystem

- Whisper.cpp is the initial local ASR runtime.
- Silero VAD (or another tested VAD) segments speech.
- Preserve source labels: system audio and microphone.
- Emit partial/final transcript events with timestamps and confidence metadata when available.
- Keep ASR model path and compute settings configurable.
- Benchmark Base and Small models on the target laptop before selecting a default.

## 6. AI provider subsystem

Define a common LLMProvider interface:
- health_check()
- list_or_validate_models()
- generate(request)
- stream(request)
- classify_error(error)

Initial adapter: Gemini API. Optional adapters: Groq and llama.cpp local runtime.

Requirements:
- Model identifiers are configuration, not hard-coded assumptions.
- Enforce request timeouts, cancellation, bounded concurrency, and per-session request limits.
- Handle 429/quota, authentication, network, and provider errors distinctly.
- Never enable paid billing or silently switch to a paid provider.
- Keep API keys in backend-only secret storage. For development use an ignored .env file; packaged Windows builds should use Windows Credential Manager or equivalent.
- Do not log keys, full prompts, resumes, or transcripts by default.

## 7. Context and data flow

1. Audio capture emits source-labelled frames.
2. VAD identifies speech segments.
3. Local ASR emits transcript segments.
4. Question detector identifies a likely completed question.
5. Context retriever selects relevant user-approved candidate/job context.
6. UI can show the question/context being used.
7. AI orchestrator sends only the minimum necessary text to the configured provider.
8. Streaming response is rendered in the desktop UI.
9. Session persistence follows the user's retention setting.

Raw audio should not be sent to a text LLM. Resume and job-description contents should remain local by default; send only selected, relevant excerpts after the user has configured that behavior.

## 8. Storage

Use SQLite for:
- app_settings
- candidate_profiles
- documents metadata
- interview_sessions
- transcript_segments
- detected_questions
- generated_responses
- provider_usage

Store original documents and optional audio recordings in a local application-data directory, not in the repository. Recording should be off by default unless explicitly enabled.

## 9. Privacy and security

- Capture state must always be visible in the app.
- Emergency stop halts capture and pending processing.
- Privacy mode protects against accidental display of sensitive app content; it is not a stealth or proctoring-evasion mechanism.
- Use supported Windows APIs only and document that capture-exclusion behavior varies by screen-sharing application.
- Default backend bind address is loopback only.
- Restrict Electron navigation and use a strict Content Security Policy.
- Validate file types and sizes before parsing.
- Treat uploaded documents and transcript text as untrusted input.
- Provide deletion controls for sessions and documents.

## 10. Initial hardware profile

Development target: Windows laptop with Ryzen 7 7435HS, 16 GB RAM, RTX 3050 Laptop GPU with 4 GB VRAM (verify before implementation).

Start with local Whisper Base/Small benchmarking and a small quantized local LLM fallback. Do not require GPU-only inference. The cloud provider is optional and must not block local capture/transcription.

## 11. Open technical decisions

- Select the most reliable WASAPI implementation after a Windows proof of concept.
- Choose Whisper.cpp model size from latency/accuracy benchmarks.
- Select local embedding model and vector index only when retrieval requirements justify them.
- Confirm current Gemini model identifiers and quotas at implementation time.
- Decide whether screenshot OCR belongs in the MVP or a later milestone.
