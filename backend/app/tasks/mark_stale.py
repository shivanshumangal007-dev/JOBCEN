"""Mark jobs stuck in PROCESSING for >15 minutes as FAILED.

Run periodically (e.g. cron, startup background task) to clean up
jobs that crashed without updating their status.
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy import update

from app.db.models.job import Job, JobStatus
from app.db.session import AsyncSessionLocal


async def mark_stale_jobs(timeout_minutes: int = 15) -> int:
    """Mark all PROCESSING jobs older than `timeout_minutes` as FAILED.

    Returns the number of rows updated.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=timeout_minutes)

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            update(Job)
            .where(Job.status == JobStatus.PROCESSING, Job.updated_at < cutoff)
            .values(status=JobStatus.FAILED, error_message="Timed out — job did not complete within the expected window.")
        )
        await db.commit()
        return result.rowcount
