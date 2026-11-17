"""SQLite connection and schema management."""

import os
import sqlite3
from pathlib import Path


def get_database_path() -> Path:
    """Return the configured database path without storing it in the repository."""
    configured_path = os.getenv("AI_INTERVIEW_DB_PATH")
    if configured_path:
        return Path(configured_path).expanduser().resolve()

    repository_root = Path(__file__).resolve().parents[4]
    return repository_root / "data" / "interview_copilot.db"


def get_connection() -> sqlite3.Connection:
    """Open a SQLite connection and ensure the local schema exists."""
    database_path = get_database_path()
    database_path.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(database_path, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS interview_sessions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('created', 'active', 'completed')),
            created_at TEXT NOT NULL,
            started_at TEXT,
            ended_at TEXT
        )
        """
    )
    connection.commit()
    return connection
