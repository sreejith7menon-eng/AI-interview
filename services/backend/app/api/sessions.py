"""Interview session HTTP endpoints."""

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.session import SessionCreate, SessionList, SessionRead
from app.services import session_service

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
def create_session(payload: SessionCreate) -> dict:
    return session_service.create_session(payload.title)


@router.get("", response_model=SessionList)
def get_sessions(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> dict:
    items, total = session_service.list_sessions(limit=limit, offset=offset)
    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.get("/{session_id}", response_model=SessionRead)
def get_session(session_id: str) -> dict:
    session = session_service.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    return session


@router.post("/{session_id}/start", response_model=SessionRead)
def start_session(session_id: str) -> dict:
    try:
        session = session_service.start_session(session_id)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    if session is None:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    return session


@router.post("/{session_id}/stop", response_model=SessionRead)
def stop_session(session_id: str) -> dict:
    try:
        session = session_service.stop_session(session_id)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    if session is None:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    return session
