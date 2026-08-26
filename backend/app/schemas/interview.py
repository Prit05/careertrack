from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class InterviewType(str, Enum):
    OA = "oa"
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    SYSTEM_DESIGN = "system_design"
    FINAL = "final"
    OTHER = "other"


class InterviewResult(str, Enum):
    PENDING = "pending"
    PASSED = "passed"
    FAILED = "failed"


class InterviewCreate(BaseModel):
    type: InterviewType
    scheduled_at: datetime
    notes: str | None = None


class InterviewUpdate(BaseModel):
    type: InterviewType | None = None
    scheduled_at: datetime | None = None
    notes: str | None = None
    result: InterviewResult | None = None


class InterviewResponse(BaseModel):
    id: str
    application_id: str
    type: InterviewType
    scheduled_at: datetime
    notes: str | None
    result: InterviewResult
    created_at: datetime