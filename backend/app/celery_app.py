from celery import Celery
from .config import get_settings

settings = get_settings()

celery_app = Celery(
    "urlforge",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "cleanup-expired-urls": {
            "task": "app.tasks.cleanup_expired_urls",
            "schedule": 3600.0,  # every hour
        }
    },
)
