import asyncio
import cloudinary
import cloudinary.uploader


from fastapi import HTTPException
from app.core.config import settings
from app.core.celery_app import celery_app
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

def run_async(coro):
    return asyncio.get_event_loop().run_until_complete(coro)

@celery_app.task(bind=True, name="tasks.parser_worker.parse_resume_task", max_retries=5)
def parse_resume_task(self, job_id: str, user_id: str, raw_text: str, is_pdf: bool = False):
    async def _execute():
        async with AsyncSessionLocal() as db:
            try:
                # 1. Update job status to processing
                await update_job_status(job_id, status="PROCESSING", db=db)

                print(f"job processing {job_id}")
                if is_pdf:
                    import base64
                    pdf_bytes = base64.b64decode(raw_text)
                    result = extract_text_and_links_from_pdf(pdf_bytes)
                    
                    # Use the extracted text and links for Gemini
                    extracted_text = result.get("text", "")
                    extracted_links = result.get("links", [])
                else:
                    extracted_text = raw_text
                    extracted_links = None
                
                # 2. Fire the heavy I/O bound AI analysis pipeline
                structured_profile = await extract_universal_profile(extracted_text, extracted_links)

                print(f"structured profile {structured_profile}")
                
                # 3. Save the resulting structured object to PostgreSQL
                await save_universal_profile(db, user_id, structured_profile)
                
                # 4. Mark job successfully complete
                await update_job_status(job_id, status="COMPLETED", db=db)
                
            except HTTPException as e:
                # Gemini often throws 503/429 wrapped in an HTTPException during high demand
                print(f"AI API limit reached, retrying in 10s: {e.detail}")
                raise self.retry(exc=e, countdown=10)
            except Exception as e:
                # Catch failures dynamically and write log to database trace
                await update_job_status(job_id, status="FAILED", error=str(e), db=db)
                raise e

    # Execute async runtime inside Celery's worker process loop
    run_async(_execute())

@celery_app.task(bind=True, name="tasks.parser_worker.upload_to_cloudinary_task", max_retries=5)
def upload_to_cloudinary_task(self, user_id: str, b64_file: str):

    try:
        # We can upload to cloudinary directly using a base64 Data URI
        data_uri = f"data:application/pdf;base64,{b64_file}"
        
        result = cloudinary.uploader.upload(
            data_uri,
            folder=f"resumes/{user_id}",
            resource_type="auto"
        )
        
        secure_url = result.get('secure_url')
        print(f"Successfully uploaded to Cloudinary: {secure_url}")
        async def _execute():
            async with AsyncSessionLocal() as db:
                try:
                    await add_user_resume(secure_url, user_id, db)
                except Exception as e:
                    print(f"Failed to add user resume to database: {str(e)}")
        
        run_async(_execute())
        return secure_url
        
    except Exception as e:
        print(f"Failed to upload to Cloudinary: {str(e)}")
        raise self.retry(exc=e, countdown=5)