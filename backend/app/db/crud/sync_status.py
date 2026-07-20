from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.platform_sync_status import PlatformSyncStatus, SyncStatus
from datetime import datetime, timezone


async def create_or_update_sync_status(
    db: AsyncSession,
    user_id: str,
    platform: str,
    status: SyncStatus,
    error_message: str | None = None,
) -> PlatformSyncStatus:
    """Create a new sync status record or update the existing one for a user+platform pair."""
    result = await db.execute(
        select(PlatformSyncStatus).filter(
            PlatformSyncStatus.user_id == user_id,
            PlatformSyncStatus.platform == platform,
        )
    )
    record = result.scalars().first()

    if record:
        record.status = status
        record.error_message = error_message
        if status == SyncStatus.SYNCED:
            record.last_synced_at = datetime.now(timezone.utc)
    else:
        record = PlatformSyncStatus(
            user_id=user_id,
            platform=platform,
            status=status,
            error_message=error_message,
        )
        if status == SyncStatus.SYNCED:
            record.last_synced_at = datetime.now(timezone.utc)
        db.add(record)

    await db.commit()
    await db.refresh(record)
    return record


async def get_sync_status_by_user_platform(
    db: AsyncSession, user_id: str, platform: str
) -> PlatformSyncStatus | None:
    """Get the sync status for a specific user and platform."""
    result = await db.execute(
        select(PlatformSyncStatus).filter(
            PlatformSyncStatus.user_id == user_id,
            PlatformSyncStatus.platform == platform,
        )
    )
    return result.scalars().first()


async def get_all_sync_statuses_for_user(
    db: AsyncSession, user_id: str
) -> list[PlatformSyncStatus]:
    """Get all sync statuses for a given user across all platforms."""
    result = await db.execute(
        select(PlatformSyncStatus).filter(
            PlatformSyncStatus.user_id == user_id,
        )
    )
    return list(result.scalars().all())
