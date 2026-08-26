from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_current_user
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatus,
    ApplicationUpdate,
    PaginatedApplications,
)
from app.services.application_service import (
    create_application,
    delete_application,
    get_application,
    get_user_applications,
    update_application,
)


router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_application_route(
    application_data: ApplicationCreate,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    try:
        return await create_application(
            user_id=current_user["_id"],
            application_data=application_data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "",
    response_model=PaginatedApplications,
)
async def list_applications(
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
    status_filter: ApplicationStatus | None = Query(
        default=None,
        alias="status",
    ),
    search: str | None = Query(
        default=None,
        min_length=1,
        max_length=100,
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
):
    return await get_user_applications(
        user_id=current_user["_id"],
        status_filter=(
            status_filter.value
            if status_filter
            else None
        ),
        search=search,
        page=page,
        limit=limit,
    )


@router.get(
    "/{application_id}",
    response_model=ApplicationResponse,
)
async def get_application_route(
    application_id: str,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    application = await get_application(
        user_id=current_user["_id"],
        application_id=application_id,
    )

    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        )

    return application


@router.patch(
    "/{application_id}",
    response_model=ApplicationResponse,
)
async def update_application_route(
    application_id: str,
    application_data: ApplicationUpdate,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    try:
        application = await update_application(
            user_id=current_user["_id"],
            application_id=application_id,
            application_data=application_data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        )

    return application


@router.delete(
    "/{application_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_application_route(
    application_id: str,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    deleted = await delete_application(
        user_id=current_user["_id"],
        application_id=application_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        )