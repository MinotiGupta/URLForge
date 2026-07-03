import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database import Base


class ClickAnalytic(Base):
    __tablename__ = "click_analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url_id = Column(UUID(as_uuid=True), ForeignKey("urls.id", ondelete="CASCADE"), nullable=False)
    country = Column(String(100), nullable=True)
    device = Column(String(50), nullable=True)
    browser = Column(String(50), nullable=True)
    os = Column(String(50), nullable=True)
    ip_hash = Column(String(64), nullable=True)
    referer = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    url = relationship("URL", back_populates="clicks")
