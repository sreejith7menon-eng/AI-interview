"""Business logic for interview session persistence and lifecycle."""

from datetime import datetime, timezone
import sqlite3
from uuid import uuid4

from app.core.database import get_connection


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_session(title: str) -> dict:
    session = {
        "id": str(uuid4()),
        "title": title.strip(),
        "status": "created",
        "created_at": _now(),
        "started_at": None,
        "ended_at": None,
    }
    with get_connection() as connection:
        connection.execute(
            """INSERT INTO interview_sessions
               (id, title, status, created_at, started_at, ended_at)
               VALUES (:id, :title, :status, :created_at, :started_at, :ended_at)""",
            session,
        )
    return session


def list_sessions(limit: int = 20, offset: int = 0) -> tuple[list[dict], int]:
    with get_connection() as connection:
        total = connection.execute(
            "SELECT COUNT(*) AS count FROM interview_sessions"
        ).fetchone()["count"]
        rows = connection.execute(
            """SELECT id, title, status, created_at, started_at, ended_at
               FROM interview_sessions
               ORDER BY created_at DESC, id DESC
               LIMIT ? OFFSET ?""",
            (limit, offset),
        ).fetchall()
    return [dict(row) for row in rows], total


def get_session(session_id: str) -> dict | None:
    with get_connection() as connection:
        row = connection.execute(
            """SELECT id, title, status, created_at, started_at, ended_at
               FROM interview_sessions WHERE id = ?""",
            (session_id,),
        ).fetchone()
    return dict(row) if row else None


def start_session(session_id: str) -> dict | None:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT status FROM interview_sessions WHERE id = ?", (session_id,)
        ).fetchone()
        if row is None:
            return None
        if row["status"] == "completed":
            raise ValueError("A completed session cannot be started again.")
        if row["status"] == "created":
            connection.execute(
                """UPDATE interview_sessions
                   SET status = 'active', started_at = ? WHERE id = ?""",
                (_now(), session_id),
            )
    return get_session(session_id)


def stop_session(session_id: str) -> dict | None:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT status FROM interview_sessions WHERE id = ?", (session_id,)
        ).fetchone()
        if row is None:
            return None
        if row["status"] != "active":
            raise ValueError("Only an active session can be stopped.")
        connection.execute(
            """UPDATE interview_sessions
               SET status = 'completed', ended_at = ? WHERE id = ?""",
            (_now(), session_id),
        )
    return get_session(session_id)
