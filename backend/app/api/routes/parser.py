import asyncio
import base64
from fastapi import UploadFile
from fastapi import APIRouter, Depends, status, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.auth_services import get_current_user
from app.db.models.user import User
from app.schemas.parser import ResumeUploadPayload
from app.db.crud.job import create_job_record, get_job_by_id
from app.tasks.parser_worker import parse_resume_task, upload_to_cloudinary_task
from app.api.deps import RedisLimiter
from app.db.crud.profile import get_current_user_profile

router = APIRouter(tags=["Parser"])
upload_limiter = RedisLimiter(times=2, seconds=60, group="upload")

@router.post("/upload", dependencies=[Depends(upload_limiter)])
async def upload_resume_data(
    payload: ResumeUploadPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    job = await create_job_record(db, user_id=current_user.id)

    asyncio.create_task(parse_resume_task(str(job.id), str(current_user.id), payload.raw_text))

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

        # Prevent OOM from arbitrarily large uploads
        MAX_PDF_SIZE = 10 * 1024 * 1024  # 10 MB
        if len(pdf_bytes) > MAX_PDF_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File too large. Maximum size is 10MB."
            )

        b64_pdf = base64.b64encode(pdf_bytes).decode('utf-8')

        # Dispatch both tasks concurrently as background coroutines
        asyncio.create_task(parse_resume_task(str(job.id), str(current_user.id), b64_pdf, True))
        asyncio.create_task(upload_to_cloudinary_task(str(current_user.id), b64_pdf))

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


@router.websocket("/get-parser-result")
async def get_parser_result_through_websocket(
    websocket: WebSocket,
    job_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await websocket.accept()
    try:
        while True:
            await asyncio.sleep(1)
            # Expire session so we don't get cached results
            db.expire_all()
            job = await get_job_by_id(job_id=job_id, user_id=current_user.id, db=db)

            if not job:
                await websocket.send_text("Job task tracker not found or access unauthorized.")
                await websocket.close()
                break

            if job.status == "COMPLETED":
                profile = await get_current_user_profile(user_id=current_user.id, db=db)
                await websocket.send_json({
                    "job_id": str(job.id),
                    "status": job.status,
                    "error": job.error_message,
                    "updated_at": job.updated_at.isoformat() if job.updated_at else None,
                    "profile": profile
                })
                await websocket.close()
                break

            if job.status == "FAILED":
                await websocket.send_json({
                    "job_id": str(job.id),
                    "status": job.status,
                    "error": job.error_message,
                    "updated_at": job.updated_at.isoformat() if job.updated_at else None
                })
                await websocket.close()
                break
        
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        await websocket.send_text(f"An error occurred: {str(e)}")
        await websocket.close()