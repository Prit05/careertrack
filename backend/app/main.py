from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.applications import router as applications_router
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.interviews import router as interviews_router
from app.api.jobs import router as jobs_router
from app.api.resumes import router as resumes_router
from app.api.users import router as users_router
from app.db.mongodb import client, initialize_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    await initialize_database()

    yield

    await client.close()


app = FastAPI(
    title="CareerTrack API",
    version="0.1.0",
    lifespan=lifespan,
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# API ROUTES
# --------------------------------------------------

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(jobs_router)
app.include_router(applications_router)
app.include_router(resumes_router)
app.include_router(interviews_router)
app.include_router(dashboard_router)


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
async def health_check():
    await client.admin.command("ping")

    return {
        "status": "ok",
        "service": "careertrack-api",
        "database": "connected",
    }