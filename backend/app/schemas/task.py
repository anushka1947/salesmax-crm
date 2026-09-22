"""
Pydantic schemas for Tasks and Follow-ups.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TaskBase(BaseModel):
    title: str
    type: str = "Call"  # Call, WhatsApp, Email, Meeting
    due_date: Optional[str] = None  # Format: YYYY-MM-DD
    priority: str = "Medium"  # Low, Medium, High
    status: str = "Pending"  # Pending, Completed
    lead_id: Optional[int] = None
    contact_id: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    lead_id: Optional[int] = None
    contact_id: Optional[int] = None


class TaskResponse(TaskBase):
    model_config = {"from_attributes": True}

    id: int
    created_at: datetime
