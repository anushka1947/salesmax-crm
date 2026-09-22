"""
Pydantic schemas for Activity Timeline.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ActivityBase(BaseModel):
    type: str  # call, whatsapp, note, stage_change, lead_created, contact_created, task_completed
    title: str
    description: Optional[str] = None
    lead_id: Optional[int] = None
    contact_id: Optional[int] = None


class ActivityCreate(ActivityBase):
    pass


class ActivityResponse(ActivityBase):
    model_config = {"from_attributes": True}

    id: int
    created_at: datetime
