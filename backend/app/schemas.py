from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional
from datetime import datetime
import uuid


# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


# URL Schemas
class URLCreate(BaseModel):
    original_url: str
    custom_alias: Optional[str] = None
    expires_in_days: Optional[int] = None  # None = never expire


class URLUpdate(BaseModel):
    original_url: Optional[str] = None
    expires_in_days: Optional[int] = None


class URLOut(BaseModel):
    id: uuid.UUID
    original_url: str
    short_code: str
    custom_alias: Optional[str]
    short_url: str
    qr_code: Optional[str]
    expires_at: Optional[datetime]
    created_at: datetime
    click_count: int
    is_active: bool

    class Config:
        from_attributes = True


# Analytics Schemas
class AnalyticsOut(BaseModel):
    total_clicks: int
    today_clicks: int
    countries: dict
    devices: dict
    browsers: dict


# Dashboard Schemas
class DashboardOut(BaseModel):
    total_users: int
    active_links: int
    total_clicks: int
    expired_links: int
    top_links: list
