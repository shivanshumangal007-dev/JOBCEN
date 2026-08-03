from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.user import UserResponse
from app.schemas.sync_status import SyncStatusCreate, SyncStatusResponse
from app.services.auth_services import get_current_user
from app.api.routes.auth import auth_limiter
from app.db.crud.sync_status import (
    create_or_update_sync_status,
    get_sync_status_by_user_platform,
    get_all_sync_statuses_for_user,
)

router = APIRouter(prefix="/sync-status", tags=["sync-status"])

@router.get("/", response_model=List[SyncStatusResponse], dependencies=[Depends(auth_limiter)])
async def get_all_sync_statuses(
    current_user: UserResponse = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """Get all platform sync statuses for the current user."""
    return await get_all_sync_statuses_for_user(db, str(current_user.id))

@router.get("/{platform}", response_model=SyncStatusResponse, dependencies=[Depends(auth_limiter)])
async def get_sync_status(
    platform: str,
    current_user: UserResponse = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """Get sync status for a specific platform for the current user."""
    record = await get_sync_status_by_user_platform(db, str(current_user.id), platform)
    if not record:
        raise HTTPException(status_code=404, detail="Sync status for this platform not found")
    return record

@router.post("/", response_model=SyncStatusResponse, dependencies=[Depends(auth_limiter)])
async def update_sync_status(
    sync_data: SyncStatusCreate,
    current_user: UserResponse = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """Create or update the sync status for a specific platform."""
    return await create_or_update_sync_status(
        db=db,
        user_id=str(current_user.id),
        platform=sync_data.platform,
        status=sync_data.status,
        error_message=sync_data.error_message
    )
