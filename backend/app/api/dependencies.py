from typing import Annotated

import jwt
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError

from app.core.config import settings
from app.db.mongodb import users_collection


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> dict:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except (InvalidTokenError, ValueError):
        raise credentials_exception

    try:
        user_object_id = ObjectId(user_id)
    except Exception:
        raise credentials_exception

    user = await users_collection.find_one(
        {"_id": user_object_id}
    )

    if user is None:
        raise credentials_exception

    return user