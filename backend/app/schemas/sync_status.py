from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
import uuid
from app.db.models.platform_sync_status import SyncStatus

class SyncStatusBase(BaseModel):
    platform: str
    status: SyncStatus
    error_message: Optional[str] = None
    data_updated: Optional[dict] = None

class SyncStatusCreate(BaseModel):
    platform: str
    data_updated: Optional[dict] = None

class SyncStatusResponse(SyncStatusBase):
    id: uuid.UUID
    user_id: uuid.UUID
    last_synced_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
