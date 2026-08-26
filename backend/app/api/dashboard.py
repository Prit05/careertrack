from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard_service import (
    get_dashboard_summary,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/summary",
    response_model=DashboardSummary,
)
async def dashboard_summary(
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    return await get_dashboard_summary(
        current_user["_id"]
    )