# AI Interview Copilot

A personal Windows desktop interview-preparation and interview-assistance application. The product is designed to provide live transcription, question understanding, candidate-context retrieval, and suggested answers, with local processing wherever practical and optional cloud AI providers.

## Project principles

- **Local-first:** audio capture, transcription (initially Whisper.cpp), document parsing, local storage, and context retrieval run on the user's machine.
- **Provider-flexible:** Gemini is the initial cloud-model integration target; other providers and a local GGUF model can be configured through adapters.
- **Cost-aware:** respect provider quotas, expose usage, avoid unnecessary requests, and support a local fallback.
- **Privacy-conscious:** minimize data sent to providers, protect credentials, provide clear capture indicators, and never expose private documents or transcripts unintentionally.
- **Transparent use:** privacy controls are for preventing accidental disclosure of personal information; the application must not be designed to evade interview monitoring or conceal prohibited assistance.

## Planned stack

- Desktop: Electron, React, TypeScript
- Local service: Python, FastAPI
- Audio: Windows WASAPI capture adapter
- Speech-to-text: Whisper.cpp
- Voice activity detection: Silero VAD
- AI: provider adapter (Gemini first), optional Groq and local GGUF runtime
- Storage: SQLite and local files
- Documents: PyMuPDF and python-docx
- Packaging: Electron Builder

Technology choices are documented in [Architecture](docs/ARCHITECTURE.md) and may be revised after a proof of concept.

## Repository layout

```text
apps/desktop/       Electron + React desktop application (planned)
services/backend/   FastAPI local service (initial scaffold implemented)
services/audio/     Audio capture and preprocessing (planned)
services/speech/    VAD and transcription (planned)
services/ai/        Provider adapters and prompt orchestration (planned)
services/documents/ Resume and job-description parsing (planned)
services/context/   Local retrieval and conversation context (planned)
docs/               Product, architecture, and roadmap documents
tests/              Cross-component automated tests (planned)
```

## Development status

**Initial backend scaffold implemented.** The FastAPI service currently exposes `GET /` and `GET /health`. Automated endpoint tests and local development instructions are included. Desktop UI, session persistence, audio capture, transcription, document processing, and AI provider integrations are not implemented yet.

See:
- [Backend setup](services/backend/README.md)
- [Requirements](docs/REQUIREMENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)

## Security

Never commit API keys, credentials, resumes, interview recordings, transcripts, local databases, or personal data. Use `.env.example` as a template only. Local secrets must be stored outside version control; the packaged Windows application should use Windows Credential Manager or an equivalent secure store.

## License

No open-source license has been selected. Until one is added, all rights remain reserved by the repository owner.
