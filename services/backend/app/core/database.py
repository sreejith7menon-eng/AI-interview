"""SQLite connection and schema management."""

from contextlib import contextmanager
import os
import sqlite3
from pathlib import Path
from typing import Iterator


def get_database_path() -> Path:
    """Return the configured database path outside the source tree by default."""
    configured_path = os.getenv("AI_INTERVIEW_DB_PATH")
    if configured_path:
        return Path(configured_path).expanduser().resolve()

    repository_root = Path(__file__).resolve().parents[4]
    return repository_root / "data" / "interview_copilot.db"


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    """Open a SQLite connection, initialize the schema, and always close it."""
    database_path = get_database_path()
    database_path.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(database_path, timeout=10)
    connection.row_factory = sqlite3.Row
    try:
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
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
