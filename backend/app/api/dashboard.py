from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models.url import URL
from ..models.user import User
from ..models.analytics import ClickAnalytic
from ..schemas import DashboardOut
from ..middleware.dependencies import get_current_admin

router = APIRouter(prefix="/api/dashboard", tags=["Admin Dashboard"])


@router.get("", response_model=DashboardOut)
def get_dashboard(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    total_users = db.query(User).count()
    active_links = db.query(URL).filter(
        (URL.expires_at == None) | (URL.expires_at > datetime.utcnow())
    ).count()
    total_clicks = db.query(URL).with_entities(
        db.query(URL.click_count).with_entities(URL.click_count)
    ).count()
    # Simpler sum
    from sqlalchemy import func
    total_clicks = db.query(func.sum(URL.click_count)).scalar() or 0
    expired_links = db.query(URL).filter(URL.expires_at < datetime.utcnow()).count()

    top_links = (
        db.query(URL)
        .order_by(URL.click_count.desc())
        .limit(10)
        .all()
    )

    return {
        "total_users": total_users,
        "active_links": active_links,
        "total_clicks": total_clicks,
        "expired_links": expired_links,
        "top_links": [
            {"short_code": u.short_code, "original_url": u.original_url, "clicks": u.click_count}
            for u in top_links
        ],
    }
