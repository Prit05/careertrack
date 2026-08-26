from datetime import datetime, timezone

from bson import ObjectId
from fastapi import UploadFile

from app.db.mongodb import resume_files, resumes_collection


MAX_RESUME_SIZE = 5 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
}


def serialize_resume(resume: dict) -> dict:
    return {
        "id": str(resume["_id"]),
        "name": resume["name"],
        "version": resume["version"],
        "filename": resume["filename"],
        "content_type": resume["content_type"],
        "size_bytes": resume["size_bytes"],
        "created_at": resume["created_at"],
    }


async def get_next_version(user_id: ObjectId) -> int:
    latest_resume = await resumes_collection.find_one(
        {"user_id": user_id},
        sort=[("version", -1)],
    )

    if latest_resume is None:
        return 1

    return latest_resume["version"] + 1


async def create_resume(
    user_id: ObjectId,
    name: str,
    file: UploadFile,
) -> dict:

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError("Only PDF resumes are supported.")

    version = await get_next_version(user_id)

    filename = file.filename or "resume.pdf"

    safe_filename = filename.replace("/", "_").replace("\\", "_")

    total_size = 0

    async with resume_files.open_upload_stream(
        safe_filename,
        metadata={
            "user_id": user_id,
            "contentType": file.content_type,
        },
    ) as grid_in:

        while True:
            chunk = await file.read(1024 * 1024)

            if not chunk:
                break

            total_size += len(chunk)

            if total_size > MAX_RESUME_SIZE:
                raise ValueError(
                    "Resume exceeds the 5 MB size limit."
                )

            await grid_in.write(chunk)

        file_id = grid_in._id

    now = datetime.now(timezone.utc)

    resume_document = {
        "user_id": user_id,
        "name": name.strip(),
        "version": version,
        "filename": safe_filename,
        "content_type": file.content_type,
        "size_bytes": total_size,
        "file_id": file_id,
        "created_at": now,
    }

    result = await resumes_collection.insert_one(
        resume_document
    )

    resume_document["_id"] = result.inserted_id

    return serialize_resume(resume_document)


async def get_user_resumes(
    user_id: ObjectId,
) -> list[dict]:

    cursor = resumes_collection.find(
        {"user_id": user_id}
    ).sort(
        "version",
        -1,
    )

    resumes = await cursor.to_list(length=None)

    return [
        serialize_resume(resume)
        for resume in resumes
    ]


async def get_resume_for_download(
    user_id: ObjectId,
    resume_id: str,
) -> tuple[dict, object] | None:

    if not ObjectId.is_valid(resume_id):
        return None

    resume = await resumes_collection.find_one(
        {
            "_id": ObjectId(resume_id),
            "user_id": user_id,
        }
    )

    if resume is None:
        return None

    try:
        stream = await resume_files.open_download_stream(
            resume["file_id"]
        )
    except Exception:
        return None

    return resume, stream


async def delete_resume(
    user_id: ObjectId,
    resume_id: str,
) -> bool:

    if not ObjectId.is_valid(resume_id):
        return False

    resume = await resumes_collection.find_one(
        {
            "_id": ObjectId(resume_id),
            "user_id": user_id,
        }
    )

    if resume is None:
        return False

    await resume_files.delete(
        resume["file_id"]
    )

    result = await resumes_collection.delete_one(
        {
            "_id": resume["_id"],
            "user_id": user_id,
        }
    )

    return result.deleted_count == 1

# PDF
#  ↓
# FastAPI UploadFile
#  ↓
# validate type
#  ↓
# validate size
#  ↓
# GridFS
#  ↓
# save metadata document