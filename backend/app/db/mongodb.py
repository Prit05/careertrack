from pymongo import ASCENDING, AsyncMongoClient

import gridfs

from app.core.config import settings


client = AsyncMongoClient(settings.mongodb_url)

database = client[settings.database_name]

users_collection = database["users"]
jobs_collection = database["jobs"]
applications_collection = database["applications"]
resumes_collection = database["resumes"]
interviews_collection = database["interviews"]

resume_files = gridfs.AsyncGridFSBucket(
    database,
    bucket_name="resumes",
)


async def initialize_database() -> None:
    await users_collection.create_index(
        [("email", ASCENDING)],
        unique=True,
        name="unique_user_email",
    )

    await jobs_collection.create_index(
        [("user_id", ASCENDING)],
        name="jobs_by_user",
    )

    await jobs_collection.create_index(
        [
            ("user_id", ASCENDING),
            ("company", ASCENDING),
        ],
        name="jobs_by_user_company",
    )

    await applications_collection.create_index(
        [("user_id", ASCENDING)],
        name="applications_by_user",
    )

    await applications_collection.create_index(
        [
            ("user_id", ASCENDING),
            ("status", ASCENDING),
        ],
        name="applications_by_user_status",
    )

    await applications_collection.create_index(
        [
            ("user_id", ASCENDING),
            ("date_applied", ASCENDING),
        ],
        name="applications_by_user_date",
    )

    await resumes_collection.create_index(
        [("user_id", ASCENDING)],
        name="resumes_by_user",
    )

    await interviews_collection.create_index(
        [("application_id", ASCENDING)],
        name="interviews_by_application",
    )

    await interviews_collection.create_index(
        [
            ("user_id", ASCENDING),
            ("scheduled_at", ASCENDING),
        ],
        name="interviews_by_user_date",
    )