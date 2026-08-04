from datetime import timezone
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.profile import Profile
from app.db.models.platform_sync_status import PlatformSyncStatus
from app.schemas.profile import UniversalProfileSchema
from sqlalchemy.orm.attributes import flag_modified
from app.db.crud.sync_status import create_or_update_sync_status
from app.services.sync_service import SyncService
from app.db.models.platform_sync_status import SyncStatus


async def save_universal_profile(db: AsyncSession, user_id: str, structured_profile: UniversalProfileSchema):
    # Check if a profile already exists for this user
    result = await db.execute(select(Profile).filter(Profile.user_id == user_id))
    existing_profile = result.scalars().first()

    profile_data = structured_profile.model_dump(mode="json")

    if existing_profile:
        existing_profile.data = profile_data
    else:
        new_profile = Profile(user_id=user_id, data=profile_data)
        db.add(new_profile)

    supported_platforms = SyncService.get_supported_platforms()
    for platform in supported_platforms:
        await create_or_update_sync_status(
            db=db,
            user_id=user_id,
            platform=platform,
            status=SyncStatus.PENDING,
            data_updated=profile_data,
            commit=False
        )

    await db.commit()
    return existing_profile or new_profile


async def get_current_user_profile(user_id: str, db: AsyncSession):

    try:
        result = await db.execute(select(Profile).filter(Profile.user_id == user_id))
        profile = result.scalars().first()

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        return profile.data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
def deep_merge_json(existing: dict, patch: dict) -> dict:
    """
    Recursively updates existing dictionary with patch dictionary.
    Sub-dicts are merged; lists and primitives in patch overwrite existing values.
    """
    merged = existing.copy() if existing else {}

    for key, value in patch.items():
        if value is None:
            continue
        
        # If both are dicts, recurse deeper
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = deep_merge_json(merged[key], value)
        else:
            # Overwrite lists, strings, numbers, etc.
            merged[key] = value

    return merged

async def update_current_user_profile(user_id: str, db: AsyncSession, profile_data: dict):
    # 1. Fetch profile
    result = await db.execute(select(Profile).filter(Profile.user_id == user_id))
    profile = result.scalars().first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # 2. Merge existing JSON with new dictionary fields
    updated_json = deep_merge_json(existing=profile.data, patch=profile_data)
    
    # 3. Assign back & inform SQLAlchemy of the JSON change
    profile.data = updated_json

    supported_platforms = SyncService.get_supported_platforms()
    for platform in supported_platforms:
        await create_or_update_sync_status(
            db=db,
            user_id=user_id,
            platform=platform,
            status=SyncStatus.PENDING,
            data_updated=updated_json,
            commit=False
        )

    flag_modified(profile, "data")

    # 4. Update timestamp
    profile.updated_at = datetime.now(timezone.utc)
    
    # 5. Commit changes to Database
    await db.commit()
    await db.refresh(profile)
    
    return profile