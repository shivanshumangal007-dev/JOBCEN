from fastapi import FastAPI
from contextlib import asynccontextmanager
import asyncio
import logging
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.db.session import engine, Base
from app.api.routes.auth import router as auth_router
from app.api.routes.profile import router as profile_router
from app.api.routes.google_auth import router as google_auth_router
from app.api.routes.parser import router as parser_router
from app.api.routes.adapters import router as adapter_router
from app.api.routes.sync_status import router as sync_status_router
import app.db.models.user  # Import models to ensure they are registered with Base
import app.db.models.profile  # noqa: F401
import app.db.models.platform_sync_status  # noqa: F401
import app.db.models.job  # noqa: F401
from app.tasks.mark_stale import mark_stale_jobs

logger = logging.getLogger("uvicorn.error")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Retry logic for serverless database cold starts (e.g. Neon)
    max_retries = 3
    for attempt in range(max_retries):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables verified.")
            break
        except Exception as e:
            if attempt == max_retries - 1:
                logger.error(f"Failed to connect to database after {max_retries} attempts.")
                raise
            logger.warning(f"Database connection failed (attempt {attempt + 1}/{max_retries}): {e}. Retrying in 2 seconds...")
            await asyncio.sleep(2)
    # Background task: sweep stale PROCESSING jobs every 10 minutes
    async def _stale_job_sweeper():
        while True:
            await asyncio.sleep(600)  # 10 minutes
            try:
                count = await mark_stale_jobs()
                if count:
                    logger.info(f"Marked {count} stale job(s) as FAILED.")
            except Exception as e:
                logger.warning(f"Stale job sweeper error: {e}")

    sweeper_task = asyncio.create_task(_stale_job_sweeper())

    yield

    sweeper_task.cancel()

environment = settings.ENVIRONMENT
if environment == "production":
    app = FastAPI(
        lifespan=lifespan,
        docs_url=None,     # Disables Swagger UI (/docs)
        redoc_url=None,    # Disables ReDoc (/redoc)
        openapi_url=None   # Disables OpenAPI schema (/openapi.json)
    )
else:
    app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(google_auth_router)
app.include_router(parser_router)
app.include_router(adapter_router)
app.include_router(sync_status_router)