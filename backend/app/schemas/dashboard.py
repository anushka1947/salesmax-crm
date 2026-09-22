"""
Pydantic schemas for Dashboard Stats.
"""

from pydantic import BaseModel
from typing import List
from app.schemas.activity import ActivityResponse


class StageStat(BaseModel):
    stage: str
    count: int
    total_value: float


class DashboardStatsResponse(BaseModel):
    total_leads: int
    total_contacts: int
    active_deals: int
    pipeline_value: float
    won_deals: int
    won_value: float
    conversion_rate: float
    tasks_due_today: int
    recent_activities: List[ActivityResponse]
    deals_by_stage: List[StageStat]
