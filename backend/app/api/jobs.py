from typing import Annotated


from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_current_user
from app.schemas.job import JobCreate, JobResponse, JobUpdate
from app.services.job_service import (
    create_job,
    delete_job,
    get_job,
    get_user_jobs,
    update_job,
)


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"],
)


@router.post(
    "",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_job_route(
    job_data: JobCreate,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    return await create_job(
        user_id=current_user["_id"],
        job_data=job_data,
    )


@router.get(
    "",
    response_model=list[JobResponse],
)
async def list_jobs(
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
    search: str | None = Query(
        default=None,
        min_length=1,
        max_length=100,
    ),
):
    return await get_user_jobs(
        user_id=current_user["_id"],
        search=search,
    )


@router.get(
    "/{job_id}",
    response_model=JobResponse,
)
async def get_job_route(
    job_id: str,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    job = await get_job(
        user_id=current_user["_id"],
        job_id=job_id,
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    return job


@router.patch(
    "/{job_id}",
    response_model=JobResponse,
)
async def update_job_route(
    job_id: str,
    job_data: JobUpdate,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    job = await update_job(
        user_id=current_user["_id"],
        job_id=job_id,
        job_data=job_data,
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    return job


@router.delete(
    "/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_job_route(
    job_id: str,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    deleted = await delete_job(
        user_id=current_user["_id"],
        job_id=job_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )