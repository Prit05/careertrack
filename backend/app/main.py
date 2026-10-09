import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.applications import router as applications_router
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.interviews import router as interviews_router
from app.api.jobs import router as jobs_router
from app.api.resumes import router as resumes_router
from app.api.users import router as users_router
from app.core.errors import CareerTrackError
from app.db.mongodb import client, initialize_database
from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format=(
        "%(asctime)s | "
        "%(levelname)s | "
        "%(name)s | "
        "%(message)s"
    ),
)

logger = logging.getLogger("careertrack")



@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting CareerTrack API")

    await initialize_database()

    logger.info("Database initialization complete")

    yield

    logger.info("Shutting down CareerTrack API")

    await client.close()


app = FastAPI(
    title="CareerTrack API",
    version="0.1.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(CareerTrackError)
async def careertrack_error_handler(
    request: Request,
    exc: CareerTrackError,
):
    logger.warning(
        "Application error: %s %s - %s",
        request.method,
        request.url.path,
        exc,
    )

    return JSONResponse(
        status_code=400,
        content={
            "detail": str(exc),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
):
    logger.exception(
        "Unhandled exception: %s %s",
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error."
        },
    )


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(jobs_router)
app.include_router(applications_router)
app.include_router(resumes_router)
app.include_router(interviews_router)
app.include_router(dashboard_router)


@app.get("/health")
async def health_check():
    await client.admin.command("ping")

    return {
        "status": "ok",
        "service": "careertrack-api",
        "database": "connected",
    }