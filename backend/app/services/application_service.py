from datetime import datetime, timezone

from bson import ObjectId
from pymongo import ReturnDocument

from app.db.mongodb import applications_collection, jobs_collection
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
)
from app.db.mongodb import (
    applications_collection,
    jobs_collection,
    resumes_collection,
)

def serialize_application(application: dict) -> dict:
    return {
        "id": str(application["_id"]),
        "job_id": str(application["job_id"]),
        "resume_id": (
            str(application["resume_id"])
            if application.get("resume_id")
            else None
        ),
        "status": application["status"],
        "date_applied": application.get("date_applied"),
        "follow_up_date": application.get("follow_up_date"),
        "notes": application.get("notes"),
        "created_at": application["created_at"],
        "updated_at": application["updated_at"],
    }


async def create_application(
    user_id: ObjectId,
    application_data: ApplicationCreate,
) -> dict:
    if not ObjectId.is_valid(application_data.job_id):
        raise ValueError("Invalid job ID.")

    job = await jobs_collection.find_one(
        {
            "_id": ObjectId(application_data.job_id),
            "user_id": user_id,
        }
    )

    if job is None:
        raise ValueError(
            "Job not found or does not belong to the current user."
        )

    # Add the new validation here
    if application_data.resume_id:
        if not ObjectId.is_valid(application_data.resume_id):
            raise ValueError("Invalid resume ID.")

        resume = await resumes_collection.find_one(
            {
                "_id": ObjectId(application_data.resume_id),
                "user_id": user_id,
            }
        )

        if resume is None:
            raise ValueError("Resume not found.")

    now = datetime.now(timezone.utc)

    document = {
        "user_id": user_id,
        "job_id": ObjectId(application_data.job_id),
        "resume_id": (
            ObjectId(application_data.resume_id)
            if application_data.resume_id
            else None
        ),
        "status": application_data.status.value,
        "date_applied": application_data.date_applied,
        "follow_up_date": application_data.follow_up_date,
        "notes": application_data.notes,
        "created_at": now,
        "updated_at": now,
    }

    result = await applications_collection.insert_one(document)

    document["_id"] = result.inserted_id

    return serialize_application(document)

async def get_application(
    user_id: ObjectId,
    application_id: str,
) -> dict | None:

    if not ObjectId.is_valid(application_id):
        return None

    application = await applications_collection.find_one(
        {
            "_id": ObjectId(application_id),
            "user_id": user_id,
        }
    )

    if application is None:
        return None

    return serialize_application(application)


async def get_user_applications(
    user_id: ObjectId,
    status_filter: str | None,
    search: str | None,
    page: int,
    limit: int,
) -> dict:

    query = {
        "user_id": user_id,
    }

    if status_filter:
        query["status"] = status_filter

    if search:
        matching_jobs_cursor = jobs_collection.find(
            {
                "user_id": user_id,
                "$or": [
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
                ],
            },
            {
                "_id": 1,
            },
        )

        matching_jobs = await matching_jobs_cursor.to_list(
            length=None
        )

        job_ids = [
            job["_id"]
            for job in matching_jobs
        ]

        query["job_id"] = {
            "$in": job_ids,
        }

    total = await applications_collection.count_documents(query)

    skip = (page - 1) * limit

    cursor = (
        applications_collection
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    applications = await cursor.to_list(length=limit)

    pages = (total + limit - 1) // limit if total else 0

    return {
        "items": [
            serialize_application(application)
            for application in applications
        ],
        "page": page,
        "limit": limit,
        "total": total,
        "pages": pages,
    }


async def update_application(
    user_id: ObjectId,
    application_id: str,
    application_data: ApplicationUpdate,
) -> dict | None:

    if not ObjectId.is_valid(application_id):
        return None

    updates = application_data.model_dump(
        exclude_unset=True
    )

    if "status" in updates:
        updates["status"] = updates["status"].value

    if "resume_id" in updates:

        if updates["resume_id"] is None:
            updates["resume_id"] = None

        elif ObjectId.is_valid(updates["resume_id"]):
            updates["resume_id"] = ObjectId(
                updates["resume_id"]
            )

        else:
            raise ValueError("Invalid resume ID.")

    updates["updated_at"] = datetime.now(timezone.utc)

    application = await applications_collection.find_one_and_update(
        {
            "_id": ObjectId(application_id),
            "user_id": user_id,
        },
        {
            "$set": updates,
        },
        return_document=ReturnDocument.AFTER,
    )

    if application is None:
        return None

    return serialize_application(application)


async def delete_application(
    user_id: ObjectId,
    application_id: str,
) -> bool:

    if not ObjectId.is_valid(application_id):
        return False

    result = await applications_collection.delete_one(
        {
            "_id": ObjectId(application_id),
            "user_id": user_id,
        }
    )

    return result.deleted_count == 1