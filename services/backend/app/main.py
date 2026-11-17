"""FastAPI entry point for the AI Interview Copilot local service."""

from datetime import datetime, timezone

from fastapi import FastAPI

app = FastAPI(
    title="AI Interview Copilot",
    description="Local backend for the AI Interview Copilot desktop application.",
    version="0.1.0",
)


@app.get("/", tags=["default"])
async def root() -> dict[str, str]:
    """Return basic application information."""
    return {
        "application": "AI Interview Copilot",
        "message": "Backend is running.",
        "version": "0.1.0",
    }


@app.get("/health", tags=["health"], summary="Health Check")
async def health_check() -> dict[str, str]:
    """Report whether the local API process is responding."""
    return {
        "status": "healthy",
        "service": "ai-interview-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
