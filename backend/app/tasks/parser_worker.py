import asyncio

from fastapi import HTTPException, status
from app.schemas.profile import UniversalProfileSchema
from app.core.config import settings
from app.core.celery_app import celery_app
from app.db.session import AsyncSessionLocal
from app.db.crud.job import update_job_status
from app.db.crud.profile import save_universal_profile
from app.services.ai_parser import extract_universal_profile


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
                
                # 2. Fire the heavy I/O bound AI analysis pipeline
                structured_profile = await extract_universal_profile(raw_text, is_pdf)

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
