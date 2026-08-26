from datetime import datetime, timezone

from bson import ObjectId
from pymongo import ReturnDocument

from app.db.mongodb import (
    applications_collection,
    interviews_collection,
)
from app.schemas.interview import (
    InterviewCreate,
    InterviewUpdate,
)


def serialize_interview(interview: dict) -> dict:
    return {
        "id": str(interview["_id"]),
        "application_id": str(interview["application_id"]),
        "type": interview["type"],
        "scheduled_at": interview["scheduled_at"],
        "notes": interview.get("notes"),
        "result": interview["result"],
        "created_at": interview["created_at"],
    }


async def create_interview(
    user_id: ObjectId,
    application_id: str,
    data: InterviewCreate,
) -> dict:

    if not ObjectId.is_valid(application_id):
        raise ValueError("Invalid application ID.")

    application = await applications_collection.find_one(
        {
            "_id": ObjectId(application_id),
            "user_id": user_id,
        }
    )

    if application is None:
        raise ValueError(
            "Application not found."
        )

    now = datetime.now(timezone.utc)

    interview = {
        "user_id": user_id,
        "application_id": ObjectId(application_id),
        "type": data.type.value,
        "scheduled_at": data.scheduled_at,
        "notes": data.notes,
        "result": "pending",
        "created_at": now,
    }

    result = await interviews_collection.insert_one(
        interview
    )

    interview["_id"] = result.inserted_id

    return serialize_interview(interview)


async def get_application_interviews(
    user_id: ObjectId,
    application_id: str,
) -> list[dict]:

    if not ObjectId.is_valid(application_id):
        return []

    application = await applications_collection.find_one(
        {
            "_id": ObjectId(application_id),
            "user_id": user_id,
        }
    )

    if application is None:
        return []

    cursor = interviews_collection.find(
        {
            "application_id": ObjectId(application_id),
            "user_id": user_id,
        }
    ).sort(
        "scheduled_at",
        1,
    )

    interviews = await cursor.to_list(
        length=None
    )

    return [
        serialize_interview(interview)
        for interview in interviews
    ]


async def update_interview(
    user_id: ObjectId,
    interview_id: str,
    data: InterviewUpdate,
) -> dict | None:

    if not ObjectId.is_valid(interview_id):
        return None

    updates = data.model_dump(
        exclude_unset=True
    )

    if "type" in updates:
        updates["type"] = updates["type"].value

    if "result" in updates:
        updates["result"] = updates["result"].value

    interview = (
        await interviews_collection
        .find_one_and_update(
            {
                "_id": ObjectId(interview_id),
                "user_id": user_id,
            },
            {
                "$set": updates,
            },
            return_document=ReturnDocument.AFTER,
        )
    )

    if interview is None:
        return None

    return serialize_interview(interview)


async def delete_interview(
    user_id: ObjectId,
    interview_id: str,
) -> bool:

    if not ObjectId.is_valid(interview_id):
        return False

    result = await interviews_collection.delete_one(
        {
            "_id": ObjectId(interview_id),
            "user_id": user_id,
        }
    )

    return result.deleted_count == 1