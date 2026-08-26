from datetime import datetime

from pydantic import BaseModel


class StatusCount(BaseModel):
    status: str
    count: int


class UpcomingInterview(BaseModel):
    id: str
    application_id: str
    type: str
    scheduled_at: datetime


class DashboardSummary(BaseModel):
    total_applications: int
    active_applications: int
    interviews: int
    offers: int
    rejected: int
    status_breakdown: list[StatusCount]
    upcoming_interviews: list[UpcomingInterview]