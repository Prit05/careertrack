from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from app.core.security import hash_password, verify_password
from app.db.mongodb import users_collection
from app.schemas.user import UserCreate


async def register_user(user_data: UserCreate) -> dict:
    normalized_email = str(user_data.email).lower()

    user_document = {
        "email": normalized_email,
        "password_hash": hash_password(user_data.password),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    try:
        result = await users_collection.insert_one(user_document)
    except DuplicateKeyError:
        raise ValueError("A user with this email already exists.")

    user_document["_id"] = result.inserted_id

    return user_document


async def authenticate_user(
    email: str,
    password: str,
) -> dict | None:

    normalized_email = email.lower()

    user = await users_collection.find_one(
        {"email": normalized_email}
    )

    if user is None:
        return None

    if not verify_password(password, user["password_hash"]):
        return None

    return user