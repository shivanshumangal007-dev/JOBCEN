import ssl
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "universal_profile_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,  # Celery will store task results in Redis
    include=["app.tasks.parser_worker"]
)

celery_app.conf.update(
    broker_use_ssl={'ssl_cert_reqs': ssl.CERT_REQUIRED},
    redis_backend_use_ssl={'ssl_cert_reqs': ssl.CERT_REQUIRED},
    task_track_started=True,
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=False,
)