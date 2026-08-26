from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field


class ApplicationStatus(str, Enum):
    SAVED = "saved"
    APPLIED = "applied"
    OA = "oa"
    INTERVIEW = "interview"
    FINAL = "final"
    OFFER = "offer"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ApplicationCreate(BaseModel):
    job_id: str
    resume_id: str | None = None
    status: ApplicationStatus = ApplicationStatus.SAVED
    date_applied: date | None = None
    follow_up_date: date | None = None
    notes: str | None = None


class ApplicationUpdate(BaseModel):
    resume_id: str | None = None
    status: ApplicationStatus | None = None
    date_applied: date | None = None
    follow_up_date: date | None = None
    notes: str | None = None


class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    resume_id: str | None
    status: ApplicationStatus
    date_applied: date | None
    follow_up_date: date | None
    notes: str | None
    created_at: datetime
    updated_at: datetime


class PaginatedApplications(BaseModel):
    items: list[ApplicationResponse]
    page: int
    limit: int
    total: int
    pages: int