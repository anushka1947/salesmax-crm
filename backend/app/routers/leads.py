"""
Leads Router — All the API endpoints for managing leads.

What is a Router?
-----------------
A router is a way to group related endpoints together. All lead-related
endpoints (list leads, create lead, get one lead, update, delete) live here.

This keeps our code organized. Instead of putting everything in main.py,
we separate endpoints by feature:
  - routers/leads.py   → Lead endpoints
  - routers/contacts.py → Contact endpoints (we'll add this later)
  - routers/deals.py   → Deal endpoints (we'll add this later)

PostgreSQL Storage
------------------
Leads are now stored in a real PostgreSQL database using SQLAlchemy.
  ✅ Data persists even when you restart the server
  ✅ Can handle thousands of leads efficiently
  ✅ Supports filtering, sorting, and complex queries
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from sqlalchemy.orm import Session

from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse
from app.models.lead import Lead
from app.database import SessionLocal

# Create a router. All endpoints here will be prefixed with "/api/leads".
router = APIRouter(
    prefix="/api/leads",
    tags=["Leads"],  # This groups endpoints together in the Swagger docs
)


# ---------------------------------------------------------------------------
# DATABASE DEPENDENCY
# ---------------------------------------------------------------------------
# This function gives each endpoint a database session to work with.
# The "yield" keyword is important:
#   1. Before yield → open a session (start a conversation with the database)
#   2. yield db     → give the session to the endpoint function
#   3. After yield  → close the session (clean up, even if there was an error)
#
# FastAPI calls this automatically for any endpoint that has "db: Session = Depends(get_db)".
# ---------------------------------------------------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------------------------


@router.get(
    "/",
    response_model=List[LeadResponse],
    summary="Get all leads",
    description="Returns a list of all leads in the system.",
)
def get_leads(db: Session = Depends(get_db)):
    """
    GET /api/leads

    db.query(Lead).all() is the SQLAlchemy equivalent of:
        SELECT * FROM leads;
    """
    leads = db.query(Lead).all()
    return leads


@router.get(
    "/{lead_id}",
    response_model=LeadResponse,
    summary="Get a single lead",
    description="Returns one lead by its ID. Returns 404 if not found.",
)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    """
    GET /api/leads/{lead_id}

    db.query(Lead).filter(Lead.id == lead_id).first() is the equivalent of:
        SELECT * FROM leads WHERE id = {lead_id} LIMIT 1;

    .first() returns None if no lead is found (instead of raising an error).
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()

    if lead is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found",
        )

    return lead


@router.post(
    "/",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new lead",
    description="Creates a new lead and returns it with a generated ID.",
)
def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    """
    POST /api/leads

    Steps:
    1. Create a SQLAlchemy Lead object from the Pydantic data
    2. db.add()    → stage it (like putting a letter in the outbox)
    3. db.commit() → save it to PostgreSQL (like sending the letter)
    4. db.refresh()→ reload the object so it has the auto-generated id
    """
    # Convert Pydantic schema to SQLAlchemy model
    # .value converts the Enum to a plain string (e.g., LeadSource.facebook → "facebook")
    new_lead = Lead(
        name=lead.name,
        email=lead.email,
        phone=lead.phone,
        company=lead.company,
        source=lead.source.value,
        status=lead.status.value,
    )

    db.add(new_lead)       # Stage the new lead
    db.commit()            # Save to PostgreSQL
    db.refresh(new_lead)   # Reload to get the auto-generated id

    return new_lead


@router.put(
    "/{lead_id}",
    response_model=LeadResponse,
    summary="Update a lead",
    description="Updates an existing lead. Only the fields you send will be changed.",
)
def update_lead(lead_id: int, lead_update: LeadUpdate, db: Session = Depends(get_db)):
    """
    PUT /api/leads/{lead_id}

    Steps:
    1. Find the lead in the database
    2. Get only the fields the user sent (exclude_unset=True)
    3. Update each field on the SQLAlchemy object
    4. Commit to save changes
    """
    # Find the lead
    lead = db.query(Lead).filter(Lead.id == lead_id).first()

    if lead is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found",
        )

    # Get only the fields the user actually sent (not None defaults)
    update_data = lead_update.model_dump(exclude_unset=True)

    # Update each field on the database object
    for field, value in update_data.items():
        # Convert enum values to strings (e.g., LeadStatus.qualified → "qualified")
        if hasattr(value, "value"):
            value = value.value
        setattr(lead, field, value)  # Same as: lead.status = "qualified"

    db.commit()       # Save changes to PostgreSQL
    db.refresh(lead)  # Reload the updated data

    return lead


@router.delete(
    "/{lead_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a lead",
    description="Permanently removes a lead. Returns no content on success.",
)
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    """
    DELETE /api/leads/{lead_id}

    db.delete() removes the row from PostgreSQL.
    Status code 204 means "No Content" — success, but nothing to send back.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()

    if lead is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found",
        )

    db.delete(lead)   # Remove from PostgreSQL
    db.commit()       # Save the deletion

    return  # 204 No Content — no response body
