from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.api.dependencies import get_current_user
from app.schemas.interview import (
    InterviewCreate,
    InterviewResponse,
    InterviewUpdate,
)
from app.services.interview_service import (
    create_interview,
    delete_interview,
    get_application_interviews,
    update_interview,
)


router = APIRouter(
    tags=["Interviews"],
)


@router.post(
    "/applications/{application_id}/interviews",
    response_model=InterviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_interview_route(
    application_id: str,
    data: InterviewCreate,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):

    try:
        return await create_interview(
            user_id=current_user["_id"],
            application_id=application_id,
            data=data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "/applications/{application_id}/interviews",
    response_model=list[InterviewResponse],
)
async def list_interviews(
    application_id: str,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    return await get_application_interviews(
        user_id=current_user["_id"],
        application_id=application_id,
    )


@router.patch(
    "/interviews/{interview_id}",
    response_model=InterviewResponse,
)
async def update_interview_route(
    interview_id: str,
    data: InterviewUpdate,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):

    interview = await update_interview(
        user_id=current_user["_id"],
        interview_id=interview_id,
        data=data,
    )

    if interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found.",
        )

    return interview


@router.delete(
    "/interviews/{interview_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_interview_route(
    interview_id: str,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    deleted = await delete_interview(
        user_id=current_user["_id"],
        interview_id=interview_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found.",
        )