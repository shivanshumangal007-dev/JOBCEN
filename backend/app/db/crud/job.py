from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.job import Job, JobStatus
from app.db.models.user import User
import uuid
from fastapi import HTTPException


async def update_job_status(job_id: str, status: str, db: AsyncSession, error: str|None = None):
    job = await db.execute(select(Job).filter(Job.id == job_id))
    job = job.scalars().first()
    if job:
        job.status = JobStatus(status)
        if error:
            job.error_message = error
        await db.commit()
    else:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

async def create_job_record(db: AsyncSession, user_id: str):
    db_job = Job(user_id=user_id, status=JobStatus.PENDING)
    db.add(db_job)
    await db.commit()
    return db_job

async def get_job_by_id(job_id: str, user_id: str, db: AsyncSession):
    job = await db.execute(select(Job).filter(Job.id == job_id, Job.user_id == user_id))
    return job.scalars().first()
