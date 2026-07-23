from sqlalchemy import false
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
# Assuming a standard declarative base setup in db/session.py
from app.db.session import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, JSON, UUID
import uuid
import datetime


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index = True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    resume: Mapped[str] = mapped_column(String, nullable=True)
    username: Mapped[str] = mapped_column(unique=False, index=True)
    hashed_password: Mapped[str] = mapped_column(nullable = True)
    is_active: Mapped[bool] = mapped_column(nullable=False, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
