"""Schemas for interview session endpoints."""

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SessionCreate(BaseModel):
    title: str = Field(default="Interview session", min_length=1, max_length=120)

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str) -> str:
        title = value.strip()
        if not title:
            raise ValueError("Session title cannot be blank.")
        return title


class SessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    status: str
    created_at: str
    started_at: str | None = None
    ended_at: str | None = None


class SessionList(BaseModel):
    items: list[SessionRead]
    total: int
    limit: int
    offset: int
