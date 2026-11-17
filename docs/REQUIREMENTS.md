# Product Requirements — AI Interview Copilot

## 1. Product goal

Build a personal-use Windows desktop application that helps a user prepare for and navigate permitted interview-assistance workflows. It combines live speech transcription, question detection, candidate-provided context, and AI-generated suggested answers.

The product must not be designed to bypass proctoring, conceal prohibited assistance, or evade interview-platform monitoring. Capture and privacy controls must be transparent and must respect interview rules and participant consent.

## 2. Target platform and users

- Primary platform: Windows 10/11, with Windows 11 as the primary development target.
- User model: single local user; no account system or SaaS backend required for the initial release.
- Repository: private personal repository.
- Runtime: local desktop app and local backend service.

## 3. Functional requirements

### FR-01 — Desktop shell
- Provide a dashboard, session view, settings, model/provider settings, and document library.
- Show service status and whether audio capture is active.
- Support start, pause, resume, and stop controls.

### FR-02 — Audio capture
- Capture selected system playback audio using a Windows WASAPI loopback implementation.
- Capture a selected microphone as a separate source.
- Allow device selection, input-level checks, and explicit capture status.
- Keep capture independent of transcription and AI request queues.

### FR-03 — Speech transcription
- Run local speech-to-text using Whisper.cpp initially.
- Use voice activity detection to segment speech and reduce unnecessary inference.
- Display partial/final transcript states and timestamps.
- Keep interviewer/system audio and microphone transcript channels distinguishable.

### FR-04 — Question detection
- Identify likely questions from completed transcript segments.
- Allow manual correction and manual question entry.
- Avoid generating repeated answers for the same question.
- Do not treat every sentence as a question.

### FR-05 — AI response generation
- Use a provider abstraction, with Gemini as the initial cloud integration.
- Support streaming responses where the provider supports it.
- Generate concise, conversational, technical, STAR, and detailed response styles.
- Include uncertainty handling and avoid fabricating candidate experience.
- Provide a local-model fallback when configured.

### FR-06 — Candidate and job context
- Import PDF, DOCX, and TXT resumes and job descriptions.
- Parse documents locally.
- Build a local candidate profile and searchable context.
- Retrieve only relevant context for a question.
- Do not transmit complete resumes by default. Show the user what context will be sent to an external provider and allow sensitive fields to be excluded.

### FR-07 — Technical and coding assistance
- Support technical explanations, troubleshooting reasoning, system design prompts, code examples, and code explanations.
- Clearly label generated suggestions as AI-generated.
- Avoid claiming that generated code has been executed or verified unless tests actually ran.

### FR-08 — Screenshot/OCR (later phase)
- Allow deliberate user-initiated screenshot import or capture.
- Perform OCR locally.
- Add local vision-model support only after the text/OCR workflow is stable.

### FR-09 — Mock interview (later phase)
- Generate practice questions from a job description.
- Support follow-up questions and structured feedback.
- Keep practice sessions local by default.

### FR-10 — Session history and analytics
- Save sessions locally only when enabled.
- Allow export and deletion.
- Provide a transcript and question/answer review.
- Provide a clear retention setting.

### FR-11 — Privacy and presentation controls
- Show an obvious capture indicator whenever audio capture is active.
- Provide an emergency stop for capture and processing.
- Provide controls to prevent accidental exposure of private documents, transcripts, and notifications.
- Support supported Windows capture-exclusion mechanisms where appropriate, while clearly documenting their limitations.
- Do not implement stealth, proctoring evasion, or concealment of prohibited assistance.

### FR-12 — Cost and provider controls
- Display provider, model, quota/error state, and estimated usage when available.
- Set configurable request limits and stop/retry behavior for quota errors.
- Avoid sending continuous audio to a text LLM.
- Do not automatically switch to a paid provider or enable billing.
- Keep model names and provider quotas configurable because availability changes.

## 4. Non-functional requirements

- Offline-capable core: local capture, transcription, document parsing, storage, and configured local model fallback work without internet.
- Cloud AI is optional and requires internet.
- Bind local backend only to loopback by default.
- Keep API keys out of renderer code, logs, source control, and crash reports.
- Use encrypted/secure OS storage for packaged credentials where feasible.
- Handle model/provider failures without stopping audio capture.
- Keep queues bounded and support cancellation of stale answer-generation tasks.
- Provide diagnostics for CPU, RAM, GPU/VRAM where available.
- Support a 60-minute soak test without unbounded memory growth.

## 5. Initial acceptance criteria

The first end-to-end prototype is accepted when:
1. The desktop app can start and stop local system-audio and microphone capture independently.
2. Audio is transcribed locally.
3. A completed question can be manually or automatically selected.
4. Relevant user-approved context can be retrieved locally.
5. A configured AI provider can generate a suggested answer.
6. The answer streams into the UI without blocking audio capture.
7. The app works with internet disconnected for local capture/transcription and reports cloud AI unavailable without crashing.
8. No secret or personal document is committed to the repository.

## 6. Out of scope for the first milestone

- macOS/Linux support.
- Multi-user accounts and cloud synchronization.
- Subscription billing.
- Automatic meeting-platform integration.
- Proctoring bypass or stealth operation.
- Fully local large-model inference as a requirement for the initial MVP.
