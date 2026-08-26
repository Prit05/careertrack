from datetime import date, datetime

from pydantic import BaseModel, Field, HttpUrl


class JobCreate(BaseModel):
    company: str = Field(min_length=1, max_length=150)
    title: str = Field(min_length=1, max_length=200)
    location: str | None = Field(default=None, max_length=150)
    employment_type: str | None = Field(default=None, max_length=50)
    job_url: HttpUrl | None = None
    description: str | None = None
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    posted_date: date | None = None
    deadline: date | None = None


class JobUpdate(BaseModel):
    company: str | None = Field(default=None, min_length=1, max_length=150)
    title: str | None = Field(default=None, min_length=1, max_length=200)
    location: str | None = Field(default=None, max_length=150)
    employment_type: str | None = Field(default=None, max_length=50)
    job_url: HttpUrl | None = None
    description: str | None = None
    required_skills: list[str] | None = None
    preferred_skills: list[str] | None = None
    posted_date: date | None = None
    deadline: date | None = None


class JobResponse(BaseModel):
    id: str
    company: str
    title: str
    location: str | None
    employment_type: str | None
    job_url: str | None
    description: str | None
    required_skills: list[str]
    preferred_skills: list[str]
    posted_date: date | None
    deadline: date | None
    created_at: datetime
    updated_at: datetime