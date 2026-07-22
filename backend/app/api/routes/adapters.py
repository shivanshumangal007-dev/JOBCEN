from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.auth_services import get_current_user
from app.db.models.user import User
from app.api.deps import RedisLimiter
from app.services.sync_service import SyncService
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/adapter", tags=["Adapters"])

adapter_limiter = RedisLimiter(times=10, seconds=60, group="adapter")


@router.get("/platforms")
async def list_supported_platforms():
    """Return a list of all supported job platforms."""
    return {"platforms": SyncService.get_supported_platforms()}


@router.get("/all")
async def get_all_filling_plans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _limiter=Depends(adapter_limiter),
):

    profile_data = await ProfileService.get_user_profile(current_user.id, db)
    return SyncService.generate_all_filling_plans(profile_data, current_user.email)


@router.get("/{platform}")
async def get_filling_plan(
    platform: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _limiter=Depends(adapter_limiter),
):

    profile_data = await ProfileService.get_user_profile(current_user.id, db)
    return SyncService.generate_filling_plan(profile_data, platform, current_user.email)
