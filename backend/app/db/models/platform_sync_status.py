import enum
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Enum, UUID, Integer
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.db.session import Base


class SyncStatus(str, enum.Enum):
    PENDING = "PENDING"
    SYNCING = "SYNCING"
    SYNCED = "SYNCED"
    FAILED = "FAILED"


class PlatformSyncStatus(Base):
    __tablename__ = "platform_sync_status"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    platform: Mapped[str] = mapped_column(String(50), nullable=False)

    status: Mapped[str] = mapped_column(
        Enum(SyncStatus, name="syncstatus"),
        nullable=False,
        default=SyncStatus.PENDING,
    )

    error_message: Mapped[str | None] = mapped_column(String, nullable=True)

    last_synced_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
