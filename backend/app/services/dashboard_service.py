from datetime import datetime, timezone

from bson import ObjectId

from app.db.mongodb import (
    applications_collection,
    interviews_collection,
)


async def get_dashboard_summary(
    user_id: ObjectId,
) -> dict:

    total_applications = (
        await applications_collection.count_documents(
            {"user_id": user_id}
        )
    )

    active_applications = (
        await applications_collection.count_documents(
            {
                "user_id": user_id,
                "status": {
                    "$nin": [
                        "rejected",
                        "withdrawn",
                        "offer",
                    ]
                },
            }
        )
    )

    offers = (
        await applications_collection.count_documents(
            {
                "user_id": user_id,
                "status": "offer",
            }
        )
    )

    rejected = (
        await applications_collection.count_documents(
            {
                "user_id": user_id,
                "status": "rejected",
            }
        )
    )

    interviews = (
        await interviews_collection.count_documents(
            {
                "user_id": user_id,
            }
        )
    )

    status_pipeline = [
        {
            "$match": {
                "user_id": user_id,
            }
        },
        {
            "$group": {
                "_id": "$status",
                "count": {
                    "$sum": 1,
                },
            }
        },
        {
            "$sort": {
                "count": -1,
            }
        },
    ]

    status_results = []

    status_cursor = await applications_collection.aggregate(
        status_pipeline
    )

    async for item in status_cursor:
        status_results.append(
            {
                "status": item["_id"],
                "count": item["count"],
            }
        )

    now = datetime.now(timezone.utc)

    interview_cursor = (
        interviews_collection
        .find(
            {
                "user_id": user_id,
                "scheduled_at": {
                    "$gte": now,
                },
            }
        )
        .sort(
            "scheduled_at",
            1,
        )
        .limit(5)
    )

    upcoming_interviews = await interview_cursor.to_list(
        length=5
    )

    return {
        "total_applications": total_applications,
        "active_applications": active_applications,
        "interviews": interviews,
        "offers": offers,
        "rejected": rejected,
        "status_breakdown": [
            {
                "status": item["status"],
                "count": item["count"],
            }
            for item in status_results
        ],
        "upcoming_interviews": [
            {
                "id": str(item["_id"]),
                "application_id": str(
                    item["application_id"]
                ),
                "type": item["type"],
                "scheduled_at": item["scheduled_at"],
            }
            for item in upcoming_interviews
        ],
    }