from datetime import datetime
from .celery_app import celery_app
from .database import SessionLocal
from .models.url import URL
from .services.cache_service import invalidate_url_cache


@celery_app.task(name="app.tasks.cleanup_expired_urls")
def cleanup_expired_urls():
    """Delete expired URLs from the database every hour."""
    db = SessionLocal()
    try:
        expired = db.query(URL).filter(
            URL.expires_at != None,
            URL.expires_at < datetime.utcnow()
        ).all()

        count = 0
        for url in expired:
            invalidate_url_cache(url.short_code)
            db.delete(url)
            count += 1

        db.commit()
        return f"Cleaned up {count} expired URLs"
    finally:
        db.close()
