from fastapi import UploadFile
import base64
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.auth_services import get_current_user
from app.db.models.user import User
from app.schemas.parser import ResumeUploadPayload
from app.db.crud.job import create_job_record, get_job_by_id
from app.tasks.parser_worker import parse_resume_task, upload_to_cloudinary_task
from app.api.deps import RedisLimiter

router = APIRouter(tags=["Parser"])
upload_limiter = RedisLimiter(times=2, seconds=60, group="upload")

@router.post("/upload", dependencies=[Depends(upload_limiter)])
async def upload_resume_data(
    payload: ResumeUploadPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    job = await create_job_record(db, user_id=current_user.id)

    parse_resume_task.delay(str(job.id), str(current_user.id), payload.raw_text)

    return {
        "job_id": job.id,
        "status": "pending",
        "message": "Resume parsing initiated. You can safely close your client device or browse elsewhere."
    }

@router.get("/status/{job_id}", status_code=status.HTTP_200_OK)
async def get_status(
    job_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    job = await get_job_by_id(job_id=job_id, user_id=current_user.id, db=db)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job task tracker not found or access unauthorized."
        )
    return {
        "job_id": job.id,
        "status": job.status,
        "error": job.error_message,
        "updated_at": job.updated_at
    }

@router.post("/upload-pdf", dependencies=[Depends(upload_limiter)])
async def upload_pdf_resume_data(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        job = await create_job_record(db, user_id=current_user.id)

        pdf_bytes = await file.read()
        b64_pdf = base64.b64encode(pdf_bytes).decode('utf-8')

        # Dispatch both tasks concurrently via Celery
        parse_resume_task.delay(str(job.id), str(current_user.id), b64_pdf, True)
        upload_to_cloudinary_task.delay(str(current_user.id), b64_pdf)

        return {
            "job_id": job.id,
            "status": "pending",
            "message": "Resume parsing initiated. You can safely close your client device or browse elsewhere."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload resume: {str(e)}"
        )