"""
Activities Router — All API endpoints for viewing and logging Activity Timeline events.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.activity import Activity
from app.models.lead import Lead
from app.models.contact import Contact
from app.schemas.activity import ActivityCreate, ActivityResponse

router = APIRouter(
    prefix="/api/activities",
    tags=["Activities"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    "/",
    response_model=List[ActivityResponse],
    summary="Get activities timeline",
    description="Returns chronological activity timeline items. Filterable by lead_id, contact_id, or type.",
)
def get_activities(
    lead_id: Optional[int] = None,
    contact_id: Optional[int] = None,
    type: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(Activity)
    if lead_id is not None:
        query = query.filter(Activity.lead_id == lead_id)
    if contact_id is not None:
        query = query.filter(Activity.contact_id == contact_id)
    if type is not None:
        query = query.filter(Activity.type == type)

    return query.order_by(Activity.created_at.desc()).limit(limit).all()


@router.get(
    "/{activity_id}",
    response_model=ActivityResponse,
    summary="Get a single activity",
    description="Returns a single activity timeline item by its ID.",
)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if activity is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity with id {activity_id} not found",
        )
    return activity


@router.post(
    "/",
    response_model=ActivityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log a new activity",
    description="Log a call, WhatsApp message, note, or custom touchpoint to the timeline.",
)
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    if activity.lead_id is not None:
        lead = db.query(Lead).filter(Lead.id == activity.lead_id).first()
        if lead is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated Lead with id {activity.lead_id} not found",
            )

    if activity.contact_id is not None:
        contact = db.query(Contact).filter(Contact.id == activity.contact_id).first()
        if contact is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated Contact with id {activity.contact_id} not found",
            )

    new_activity = Activity(
        type=activity.type,
        title=activity.title,
        description=activity.description,
        lead_id=activity.lead_id,
        contact_id=activity.contact_id,
    )

    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)

    return new_activity
