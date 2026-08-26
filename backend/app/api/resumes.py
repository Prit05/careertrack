from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import StreamingResponse

from app.api.dependencies import get_current_user
from app.schemas.resume import ResumeResponse
from app.services.resume_service import (
    create_resume,
    delete_resume,
    get_resume_for_download,
    get_user_resumes,
)


router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)


@router.post(
    "",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_resume(
    name: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):

    try:
        return await create_resume(
            user_id=current_user["_id"],
            name=name,
            file=file,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "",
    response_model=list[ResumeResponse],
)
async def list_resumes(
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    return await get_user_resumes(
        current_user["_id"]
    )


@router.get(
    "/{resume_id}/download",
)
async def download_resume(
    resume_id: str,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    result = await get_resume_for_download(
        user_id=current_user["_id"],
        resume_id=resume_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    resume, stream = result

    return StreamingResponse(
        stream,
        media_type=resume["content_type"],
        headers={
            "Content-Disposition": (
                f'attachment; filename="{resume["filename"]}"'
            )
        },
    )


@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_resume(
    resume_id: str,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    deleted = await delete_resume(
        user_id=current_user["_id"],
        resume_id=resume_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )