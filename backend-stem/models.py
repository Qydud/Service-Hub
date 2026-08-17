from datetime import datetime, timezone, timedelta

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base

ASTANA_TZ = timezone(timedelta(hours=5))


def astana_now_str() -> str:
    return datetime.now(ASTANA_TZ).strftime("%Y-%m-%d %H:%M:%S")


class User(Base):
    """Administrator account. Public customers do not need an account."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    password = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False, server_default="false")

    applications = relationship("Application", back_populates="user")


class Application(Base):
    """Customer service request submitted from the public website."""

    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, nullable=False)
    contact_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    object_address = Column(String, nullable=False)
    service = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    photo = Column(String, nullable=True)
    status = Column(String, nullable=False, default="new", index=True)
    created_at = Column(String, nullable=False, default=astana_now_str)
    updated_at = Column(String, nullable=False, default=astana_now_str)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="applications")
