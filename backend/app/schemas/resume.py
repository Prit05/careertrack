from datetime import datetime

from pydantic import BaseModel, Field


class ResumeResponse(BaseModel):
    id: str
    name: str
    version: int
    filename: str
    content_type: str
    size_bytes: int
    created_at: datetime