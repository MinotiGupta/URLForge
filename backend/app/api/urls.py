from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
import hashlib
from user_agents import parse as parse_ua

from ..database import get_db
from ..schemas import URLCreate, URLUpdate, URLOut, AnalyticsOut
from ..models.url import URL
from ..models.user import User
from ..services.url_service import (
    create_short_url,
    get_url_by_code,
    get_analytics,
    record_click,
)
from ..services.cache_service import cache_url, get_cached_url, invalidate_url_cache
from ..middleware.dependencies import get_current_user, get_optional_user
from ..config import get_settings

router = APIRouter(tags=["URLs"])
settings = get_settings()


@router.post("/api/shorten", response_model=URLOut, status_code=status.HTTP_201_CREATED)
def shorten_url(
    payload: URLCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    expires_at = None
    if payload.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=payload.expires_in_days)

    try:
        url = create_short_url(
            db,
            original_url=payload.original_url,
            user_id=str(current_user.id) if current_user else None,
            custom_alias=payload.custom_alias,
            expires_at=expires_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Cache it
    cache_url(url.short_code, url.original_url)

    return {**url.__dict__, "short_url": f"{settings.BASE_URL}/{url.short_code}"}


@router.get("/api/urls", response_model=List[URLOut])
def list_my_urls(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    urls = db.query(URL).filter(URL.user_id == current_user.id).order_by(URL.created_at.desc()).all()
    return [
        {**u.__dict__, "short_url": f"{settings.BASE_URL}/{u.short_code}"}
        for u in urls
    ]


@router.get("/api/analytics/{url_id}", response_model=AnalyticsOut)
def url_analytics(
    url_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    url = db.query(URL).filter(URL.id == url_id, URL.user_id == current_user.id).first()
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
    return get_analytics(db, url_id)


@router.delete("/api/url/{url_id}", status_code=204)
def delete_url(
    url_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    url = db.query(URL).filter(URL.id == url_id, URL.user_id == current_user.id).first()
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
    invalidate_url_cache(url.short_code)
    db.delete(url)
    db.commit()


@router.put("/api/url/{url_id}", response_model=URLOut)
def update_url(
    url_id: str,
    payload: URLUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    url = db.query(URL).filter(URL.id == url_id, URL.user_id == current_user.id).first()
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")

    if payload.original_url:
        url.original_url = payload.original_url
    if payload.expires_in_days is not None:
        url.expires_at = datetime.utcnow() + timedelta(days=payload.expires_in_days)

    db.commit()
    db.refresh(url)
    invalidate_url_cache(url.short_code)
    return {**url.__dict__, "short_url": f"{settings.BASE_URL}/{url.short_code}"}


@router.get("/{short_code}")
def redirect_url(short_code: str, request: Request, db: Session = Depends(get_db)):
    # Try Redis first
    cached = get_cached_url(short_code)
    if cached:
        original_url = cached
    else:
        url = get_url_by_code(db, short_code)
        if not url:
            raise HTTPException(status_code=404, detail="Short URL not found or expired")
        original_url = url.original_url
        cache_url(short_code, original_url)

    # Record analytics async-ish (best effort)
    url_obj = db.query(URL).filter(URL.short_code == short_code).first()
    if url_obj:
        ua_string = request.headers.get("User-Agent", "")
        ua = parse_ua(ua_string)
        ip = request.client.host if request.client else ""
        ip_hash = hashlib.sha256(ip.encode()).hexdigest() if ip else None

        record_click(
            db,
            url_id=str(url_obj.id),
            country=None,  # Geo lookup would need a GeoIP DB
            device="Mobile" if ua.is_mobile else "Tablet" if ua.is_tablet else "Desktop",
            browser=ua.browser.family,
            os=ua.os.family,
            ip_hash=ip_hash,
            referer=request.headers.get("Referer"),
        )

    return RedirectResponse(url=original_url, status_code=302)
