import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database import Base


class URL(Base):
    __tablename__ = "urls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    original_url = Column(Text, nullable=False)
    short_code = Column(String(20), unique=True, index=True, nullable=False)
    custom_alias = Column(String(50), unique=True, index=True, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    click_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    qr_code = Column(Text, nullable=True)  # base64 encoded QR image

    owner = relationship("User", back_populates="urls")
    clicks = relationship("ClickAnalytic", back_populates="url", cascade="all, delete-orphan")
