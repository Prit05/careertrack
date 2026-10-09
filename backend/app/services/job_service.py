from datetime import datetime, timezone

from bson import ObjectId
from pymongo import ReturnDocument

from app.core.utils import date_to_datetime
from app.db.mongodb import jobs_collection
from app.schemas.job import JobCreate, JobUpdate
from app.core.errors import (
    InvalidResourceError,
    ResourceNotFoundError,
)

def serialize_job(job: dict) -> dict:
    return {
        "id": str(job["_id"]),
        "company": job["company"],
        "title": job["title"],
        "location": job.get("location"),
        "employment_type": job.get("employment_type"),
        "job_url": job.get("job_url"),
        "description": job.get("description"),
        "required_skills": job.get("required_skills", []),
        "preferred_skills": job.get("preferred_skills", []),
        "posted_date": job.get("posted_date"),
        "deadline": job.get("deadline"),
        "created_at": job["created_at"],
        "updated_at": job["updated_at"],
    }


async def create_job(user_id: ObjectId, job_data: JobCreate) -> dict:
    now = datetime.now(timezone.utc)

    document = {
    "user_id": user_id,
    "company": job_data.company.strip(),
    "title": job_data.title.strip(),
    "location": job_data.location,
    "employment_type": job_data.employment_type,
    "job_url": (
        str(job_data.job_url)
        if job_data.job_url
        else None
    ),
    "description": job_data.description,
    "required_skills": job_data.required_skills,
    "preferred_skills": job_data.preferred_skills,
    "posted_date": date_to_datetime(
        job_data.posted_date
    ),
    "deadline": date_to_datetime(
        job_data.deadline
    ),
    "created_at": now,
    "updated_at": now,
}

    result = await jobs_collection.insert_one(document)

    document["_id"] = result.inserted_id

    return serialize_job(document)


async def get_user_jobs(
    user_id: ObjectId,
    search: str | None = None,
) -> list[dict]:

    query = {
        "user_id": user_id,
    }

    if search:
        query["$or"] = [
            {
                "company": {
                    "$regex": search,
                    "$options": "i",
                }
            },
            {
                "title": {
                    "$regex": search,
                    "$options": "i",
                }
            },
        ]

    cursor = jobs_collection.find(query).sort(
        "created_at",
        -1,
    )

    jobs = await cursor.to_list(length=None)

    return [serialize_job(job) for job in jobs]


async def get_job(
    user_id: ObjectId,
    job_id: str,
) -> dict:

    if not ObjectId.is_valid(job_id):
        raise InvalidResourceError(
            "Invalid job ID."
        )

    job = await jobs_collection.find_one(
        {
            "_id": ObjectId(job_id),
            "user_id": user_id,
        }
    )

    if job is None:
        raise ResourceNotFoundError(
            "Job not found."
        )

    return serialize_job(job)

async def update_job(
    user_id: ObjectId,
    job_id: str,
    job_data: JobUpdate,
) -> dict | None:

    if not ObjectId.is_valid(job_id):
        return None

    updates = job_data.model_dump(
        exclude_unset=True
    )

    if "job_url" in updates and updates["job_url"] is not None:
        updates["job_url"] = str(updates["job_url"])

    if "company" in updates:
        updates["company"] = updates["company"].strip()

    if "title" in updates:
        updates["title"] = updates["title"].strip()

    updates["updated_at"] = datetime.now(timezone.utc)

    job = await jobs_collection.find_one_and_update(
        {
            "_id": ObjectId(job_id),
            "user_id": user_id,
        },
        {
            "$set": updates,
        },
        return_document=ReturnDocument.AFTER,
    )

    if job is None:
        return None

    return serialize_job(job)


async def delete_job(
    user_id: ObjectId,
    job_id: str,
) -> bool:

    if not ObjectId.is_valid(job_id):
        return False

    result = await jobs_collection.delete_one(
        {
            "_id": ObjectId(job_id),
            "user_id": user_id,
        }
    )

    return result.deleted_count == 1