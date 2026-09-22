"""
Deals Router — All API endpoints for managing Deals and Pipeline.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.deal import Deal
from app.models.lead import Lead
from app.models.contact import Contact
from app.models.activity import Activity
from app.schemas.deal import DealCreate, DealUpdate, DealStageUpdate, DealResponse

router = APIRouter(
    prefix="/api/deals",
    tags=["Deals"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    "/",
    response_model=List[DealResponse],
    summary="Get all deals",
    description="Returns all deals. Optionally filter by pipeline stage, lead_id, or contact_id.",
)
def get_deals(
    stage: Optional[str] = None,
    lead_id: Optional[int] = None,
    contact_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Deal)
    if stage is not None:
        query = query.filter(Deal.stage == stage)
    if lead_id is not None:
        query = query.filter(Deal.lead_id == lead_id)
    if contact_id is not None:
        query = query.filter(Deal.contact_id == contact_id)
    return query.all()


@router.get(
    "/{deal_id}",
    response_model=DealResponse,
    summary="Get a single deal",
    description="Returns a single deal by its ID.",
)
def get_deal(deal_id: int, db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if deal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deal with id {deal_id} not found",
        )
    return deal


@router.post(
    "/",
    response_model=DealResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new deal",
    description="Creates a deal in the sales pipeline and logs an activity record.",
)
def create_deal(deal: DealCreate, db: Session = Depends(get_db)):
    # Validate lead_id if provided
    if deal.lead_id is not None:
        lead = db.query(Lead).filter(Lead.id == deal.lead_id).first()
        if lead is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated Lead with id {deal.lead_id} not found",
            )

    # Validate contact_id if provided
    if deal.contact_id is not None:
        contact = db.query(Contact).filter(Contact.id == deal.contact_id).first()
        if contact is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated Contact with id {deal.contact_id} not found",
            )

    new_deal = Deal(
        title=deal.title,
        value=deal.value,
        stage=deal.stage,
        expected_close_date=deal.expected_close_date,
        lead_id=deal.lead_id,
        contact_id=deal.contact_id,
    )

    db.add(new_deal)
    db.commit()
    db.refresh(new_deal)

    # Log activity for timeline
    activity = Activity(
        type="deal_created",
        title=f"Deal Created: {new_deal.title}",
        description=f"Value: ₹{new_deal.value:,.2f} | Stage: {new_deal.stage}",
        lead_id=new_deal.lead_id,
        contact_id=new_deal.contact_id,
    )
    db.add(activity)
    db.commit()

    return new_deal


@router.put(
    "/{deal_id}",
    response_model=DealResponse,
    summary="Update a deal",
    description="Updates fields of an existing deal.",
)
def update_deal(deal_id: int, deal_update: DealUpdate, db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if deal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deal with id {deal_id} not found",
        )

    update_data = deal_update.model_dump(exclude_unset=True)

    # Validate lead_id if updated
    if "lead_id" in update_data and update_data["lead_id"] is not None:
        lead = db.query(Lead).filter(Lead.id == update_data["lead_id"]).first()
        if lead is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated Lead with id {update_data['lead_id']} not found",
            )

    # Validate contact_id if updated
    if "contact_id" in update_data and update_data["contact_id"] is not None:
        contact = db.query(Contact).filter(Contact.id == update_data["contact_id"]).first()
        if contact is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated Contact with id {update_data['contact_id']} not found",
            )

    old_stage = deal.stage
    for field, value in update_data.items():
        setattr(deal, field, value)

    # If stage changed, log activity
    if "stage" in update_data and update_data["stage"] != old_stage:
        activity = Activity(
            type="stage_change",
            title=f"Stage Changed: {deal.title}",
            description=f"Moved from '{old_stage}' to '{deal.stage}'",
            lead_id=deal.lead_id,
            contact_id=deal.contact_id,
        )
        db.add(activity)

    db.commit()
    db.refresh(deal)
    return deal


@router.put(
    "/{deal_id}/stage",
    response_model=DealResponse,
    summary="Update deal stage (Kanban mover)",
    description="Quickly advances or moves a deal to a new stage in the visual pipeline.",
)
def update_deal_stage(deal_id: int, stage_update: DealStageUpdate, db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if deal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deal with id {deal_id} not found",
        )

    old_stage = deal.stage
    deal.stage = stage_update.stage

    activity = Activity(
        type="stage_change",
        title=f"Pipeline Update: {deal.title}",
        description=f"Stage updated from '{old_stage}' to '{deal.stage}'",
        lead_id=deal.lead_id,
        contact_id=deal.contact_id,
    )
    db.add(activity)

    db.commit()
    db.refresh(deal)
    return deal


@router.delete(
    "/{deal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a deal",
    description="Permanently removes a deal from the pipeline.",
)
def delete_deal(deal_id: int, db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if deal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deal with id {deal_id} not found",
        )
    db.delete(deal)
    db.commit()
    return
