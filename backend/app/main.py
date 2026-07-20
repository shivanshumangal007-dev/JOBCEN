import fastapi
from fastapi import FastAPI
from contextlib import asynccontextmanager
import asyncio
import logging

from app.db.session import engine, Base
from app.api.routes.auth import router as auth_router
from app.api.routes.profile import router as profile_router
from app.api.routes.google_auth import router as google_auth_router
from app.api.routes.parser import router as parser_router
from app.api.routes.adapters import router as adapter_router
import app.db.models.user  # Import models to ensure they are registered with Base
import app.db.models.profile  # noqa: F401
import app.db.models.platform_sync_status  # noqa: F401

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
            
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(google_auth_router)
app.include_router(parser_router)
app.include_router(adapter_router)