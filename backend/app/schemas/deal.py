"""
Pydantic schemas for Deals.

Supported stages:
  - New
  - Qualified
  - Proposal
  - Negotiation
  - Won
  - Lost
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DealBase(BaseModel):
    title: str
    value: float = 0.0
    stage: str = "New"
    expected_close_date: Optional[str] = None
    lead_id: Optional[int] = None
    contact_id: Optional[int] = None


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    title: Optional[str] = None
    value: Optional[float] = None
    stage: Optional[str] = None
    expected_close_date: Optional[str] = None
    lead_id: Optional[int] = None
    contact_id: Optional[int] = None


class DealStageUpdate(BaseModel):
    stage: str  # For quick drag-and-drop Kanban updates


class DealResponse(DealBase):
    model_config = {"from_attributes": True}

    id: int
    created_at: datetime
