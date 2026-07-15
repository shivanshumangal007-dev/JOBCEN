import fastapi
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.db.session import engine, Base
from app.api.routes.auth import router as auth_router
from app.api.routes.profile import router as profile_router
from app.api.routes.google_auth import router as google_auth_router
import app.db.models.user  # Import models to ensure they are registered with Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(google_auth_router)