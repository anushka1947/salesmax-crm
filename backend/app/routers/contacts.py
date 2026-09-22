"""
Contacts Router — All API endpoints for managing Contacts.

Features:
---------
- List all contacts: GET /api/contacts/
- Get single contact: GET /api/contacts/{contact_id}
- Create contact: POST /api/contacts/
- Update contact: PUT /api/contacts/{contact_id}
- Delete contact: DELETE /api/contacts/{contact_id}

Lead Validation:
----------------
If a contact is linked to a lead (lead_id is provided), we verify that
the corresponding Lead exists in the database first. If not found, a 404
is returned to protect data integrity.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.contact import Contact
from app.models.lead import Lead
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse

# Create router with prefix /api/contacts
router = APIRouter(
    prefix="/api/contacts",
    tags=["Contacts"],
)


# ---------------------------------------------------------------------------
# DATABASE DEPENDENCY
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
    response_model=List[ContactResponse],
    summary="Get all contacts",
    description="Returns a list of all contacts stored in the database.",
)
def get_contacts(db: Session = Depends(get_db)):
    """
    GET /api/contacts/
    Fetches all contact records from PostgreSQL.
    """
    contacts = db.query(Contact).all()
    return contacts


@router.get(
    "/{contact_id}",
    response_model=ContactResponse,
    summary="Get a single contact",
    description="Returns a single contact by its ID. Returns 404 if not found.",
)
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    """
    GET /api/contacts/{contact_id}
    Fetches one contact by primary key ID.
    """
    contact = db.query(Contact).filter(Contact.id == contact_id).first()

    if contact is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with id {contact_id} not found",
        )

    return contact


@router.post(
    "/",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new contact",
    description="Creates a new contact. If lead_id is provided, verifies that the lead exists.",
)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    """
    POST /api/contacts/
    Validates input data and inserts a new contact row into PostgreSQL.
    """
    # If lead_id is specified, ensure that the lead actually exists
    if contact.lead_id is not None:
        lead = db.query(Lead).filter(Lead.id == contact.lead_id).first()
        if lead is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated Lead with id {contact.lead_id} not found",
            )

    new_contact = Contact(
        first_name=contact.first_name,
        last_name=contact.last_name,
        email=contact.email,
        phone=contact.phone,
        company_name=contact.company_name,
        designation=contact.designation,
        address=contact.address,
        city=contact.city,
        state=contact.state,
        pincode=contact.pincode,
        lead_id=contact.lead_id,
    )

    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)

    return new_contact


@router.put(
    "/{contact_id}",
    response_model=ContactResponse,
    summary="Update a contact",
    description="Updates an existing contact. Validates lead_id if modified.",
)
def update_contact(contact_id: int, contact_update: ContactUpdate, db: Session = Depends(get_db)):
    """
    PUT /api/contacts/{contact_id}
    Updates fields on an existing contact record.
    """
    contact = db.query(Contact).filter(Contact.id == contact_id).first()

    if contact is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with id {contact_id} not found",
        )

    update_data = contact_update.model_dump(exclude_unset=True)

    # If lead_id is being updated, verify the new lead exists
    if "lead_id" in update_data and update_data["lead_id"] is not None:
        new_lead_id = update_data["lead_id"]
        lead = db.query(Lead).filter(Lead.id == new_lead_id).first()
        if lead is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated Lead with id {new_lead_id} not found",
            )

    # Apply updates
    for field, value in update_data.items():
        setattr(contact, field, value)

    db.commit()
    db.refresh(contact)

    return contact


@router.delete(
    "/{contact_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a contact",
    description="Permanently removes a contact from the database.",
)
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    """
    DELETE /api/contacts/{contact_id}
    Deletes the contact record from PostgreSQL.
    """
    contact = db.query(Contact).filter(Contact.id == contact_id).first()

    if contact is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with id {contact_id} not found",
        )

    db.delete(contact)
    db.commit()

    return
