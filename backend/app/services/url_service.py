import hashlib
import random
import string
import io
import base64
from datetime import datetime
from typing import Optional
import qrcode
from sqlalchemy.orm import Session
from ..models.url import URL
from ..models.analytics import ClickAnalytic
from ..config import get_settings

settings = get_settings()


def generate_short_code(length: int = 6) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(random.choices(chars, k=length))


def generate_qr_code(url: str) -> str:
    """Generate a base64-encoded QR code image."""
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def create_short_url(
    db: Session,
    original_url: str,
    user_id: Optional[str] = None,
    custom_alias: Optional[str] = None,
    expires_at: Optional[datetime] = None,
) -> URL:
    # Determine short code
    if custom_alias:
        existing = db.query(URL).filter(URL.short_code == custom_alias).first()
        if existing:
            raise ValueError(f"Alias '{custom_alias}' is already taken")
        short_code = custom_alias
    else:
        while True:
            short_code = generate_short_code(settings.SHORT_CODE_LENGTH)
            if not db.query(URL).filter(URL.short_code == short_code).first():
                break

    short_url = f"{settings.BASE_URL}/{short_code}"
    qr_code = generate_qr_code(short_url)

    url = URL(
        user_id=user_id,
        original_url=original_url,
        short_code=short_code,
        custom_alias=custom_alias,
        expires_at=expires_at,
        qr_code=qr_code,
    )
    db.add(url)
    db.commit()
    db.refresh(url)
    return url


def get_url_by_code(db: Session, short_code: str) -> Optional[URL]:
    url = db.query(URL).filter(URL.short_code == short_code).first()
    if not url:
        return None
    # Check expiry
    if url.expires_at and url.expires_at < datetime.utcnow():
        return None
    return url


def record_click(
    db: Session,
    url_id: str,
    country: Optional[str],
    device: Optional[str],
    browser: Optional[str],
    os: Optional[str],
    ip_hash: Optional[str],
    referer: Optional[str],
) -> ClickAnalytic:
    click = ClickAnalytic(
        url_id=url_id,
        country=country,
        device=device,
        browser=browser,
        os=os,
        ip_hash=ip_hash,
        referer=referer,
    )
    db.add(click)
    # Increment click count
    db.query(URL).filter(URL.id == url_id).update({"click_count": URL.click_count + 1})
    db.commit()
    return click


def get_analytics(db: Session, url_id: str) -> dict:
    url = db.query(URL).filter(URL.id == url_id).first()
    if not url:
        return {}

    clicks = db.query(ClickAnalytic).filter(ClickAnalytic.url_id == url_id).all()
    today = datetime.utcnow().date()

    countries = {}
    devices = {}
    browsers = {}
    today_clicks = 0

    for c in clicks:
        if c.country:
            countries[c.country] = countries.get(c.country, 0) + 1
        if c.device:
            devices[c.device] = devices.get(c.device, 0) + 1
        if c.browser:
            browsers[c.browser] = browsers.get(c.browser, 0) + 1
        if c.timestamp and c.timestamp.date() == today:
            today_clicks += 1

    return {
        "total_clicks": url.click_count,
        "today_clicks": today_clicks,
        "countries": countries,
        "devices": devices,
        "browsers": browsers,
    }
