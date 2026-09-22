"""
Dashboard Router — Aggregated real-time metrics and KPIs for SalesMax CRM.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import SessionLocal
from app.models.lead import Lead
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.task import Task
from app.models.activity import Activity
from app.schemas.dashboard import DashboardStatsResponse, StageStat

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    "/stats",
    response_model=DashboardStatsResponse,
    summary="Get aggregated dashboard metrics",
    description="Calculates live CRM metrics from PostgreSQL: leads, contacts, deals, pipeline value, win rate, tasks, and recent activity.",
)
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Counts
    total_leads = db.query(Lead).count()
    total_contacts = db.query(Contact).count()

    # Deals analytics
    all_deals = db.query(Deal).all()
    total_deals = len(all_deals)

    active_deals = sum(1 for d in all_deals if d.stage not in ("Won", "Lost"))
    pipeline_value = sum(d.value for d in all_deals if d.stage not in ("Won", "Lost"))

    won_deals = sum(1 for d in all_deals if d.stage == "Won")
    won_value = sum(d.value for d in all_deals if d.stage == "Won")

    conversion_rate = round((won_deals / total_deals * 100), 1) if total_deals > 0 else 0.0

    # Tasks due today or pending
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    pending_tasks = db.query(Task).filter(Task.status == "Pending").all()
    # Count tasks with due_date <= today or total pending tasks
    tasks_due_today = sum(1 for t in pending_tasks if not t.due_date or t.due_date <= today_str)

    # Recent activities (last 10)
    recent_activities = db.query(Activity).order_by(Activity.created_at.desc()).limit(10).all()

    # Stage breakdown for Kanban / charts
    stages = ["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"]
    deals_by_stage = []
    for stage in stages:
        stage_deals = [d for d in all_deals if d.stage == stage]
        deals_by_stage.append(
            StageStat(
                stage=stage,
                count=len(stage_deals),
                total_value=sum(d.value for d in stage_deals),
            )
        )

    return DashboardStatsResponse(
        total_leads=total_leads,
        total_contacts=total_contacts,
        active_deals=active_deals,
        pipeline_value=pipeline_value,
        won_deals=won_deals,
        won_value=won_value,
        conversion_rate=conversion_rate,
        tasks_due_today=tasks_due_today,
        recent_activities=recent_activities,
        deals_by_stage=deals_by_stage,
    )
