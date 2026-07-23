import asyncio
import base64
import cloudinary
import cloudinary.uploader

from fastapi import HTTPException
from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.db.crud.job import update_job_status
from app.db.crud.profile import save_universal_profile
from app.db.crud.user import add_user_resume
from app.services.ai_parser import extract_universal_profile
from app.services.pdf_extractor import extract_text_and_links_from_pdf

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True  # Forces HTTPS URLs
)

MAX_RETRIES = 5


async def parse_resume_task(job_id: str, user_id: str, raw_text: str, is_pdf: bool = False):
    """
    Background task: parses a resume (raw text or PDF) via AI and saves the
    structured profile to the database. Retries up to MAX_RETRIES times on
    transient AI API errors (429/503).
    """
    async with AsyncSessionLocal() as db:
        try:
            # 1. Update job status to processing
            await update_job_status(job_id, status="PROCESSING", db=db)

            print(f"job processing {job_id}")
            if is_pdf:
                pdf_bytes = base64.b64decode(raw_text)
                result = extract_text_and_links_from_pdf(pdf_bytes)

                # Use the extracted text and links for Gemini
                extracted_text = result.get("text", "")
                extracted_links = result.get("links", [])
            else:
                extracted_text = raw_text
                extracted_links = None

            # 2. Fire the heavy I/O bound AI analysis pipeline (with retry)
            last_exception = None
            for attempt in range(1, MAX_RETRIES + 1):
                try:
                    structured_profile = await extract_universal_profile(extracted_text, extracted_links)
                    break  # Success — exit retry loop
                except HTTPException as e:
                    last_exception = e
                    print(f"AI API error (attempt {attempt}/{MAX_RETRIES}), retrying in 10s: {e.detail}")
                    if attempt < MAX_RETRIES:
                        await asyncio.sleep(10)
            else:
                # All retries exhausted
                if last_exception is not None:
                    raise last_exception
                raise Exception("Retries exhausted without specific HTTP exception")

            print(f"structured profile {structured_profile}")

            # 3. Save the resulting structured object to PostgreSQL
            await save_universal_profile(db, user_id, structured_profile)

            # 4. Mark job successfully complete
            await update_job_status(job_id, status="COMPLETED", db=db)

        except Exception as e:
            # Catch failures dynamically and write log to database trace
            await update_job_status(job_id, status="FAILED", error=str(e), db=db)
            print(f"parse_resume_task failed for job {job_id}: {e}")


async def upload_to_cloudinary_task(user_id: str, b64_file: str):
    """
    Background task: uploads a PDF to Cloudinary and saves the resulting
    URL to the user's record. Retries up to MAX_RETRIES times on failure.
    """
    last_exception = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            # Upload to Cloudinary directly using a base64 Data URI
            data_uri = f"data:application/pdf;base64,{b64_file}"

            # Cloudinary's upload is synchronous/blocking, so run it in a
            # thread to avoid blocking the asyncio event loop.
            result = await asyncio.to_thread(
                cloudinary.uploader.upload,
                data_uri,
                folder=f"resumes/{user_id}",
                resource_type="auto"
            )

            secure_url = result.get('secure_url')
            print(f"Successfully uploaded to Cloudinary: {secure_url}")

            async with AsyncSessionLocal() as db:
                try:
                    await add_user_resume(secure_url, user_id, db)
                except Exception as e:
                    print(f"Failed to add user resume to database: {str(e)}")

            return secure_url

        except Exception as e:
            last_exception = e
            print(f"Cloudinary upload failed (attempt {attempt}/{MAX_RETRIES}): {str(e)}")
            if attempt < MAX_RETRIES:
                await asyncio.sleep(5)

    # All retries exhausted
    print(f"upload_to_cloudinary_task permanently failed for user {user_id}: {last_exception}")