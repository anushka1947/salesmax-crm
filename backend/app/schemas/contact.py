"""
Pydantic schemas for Contacts.

What are these schemas for?
---------------------------
- ContactBase: Shared fields used by creation and response models.
- ContactCreate: What the client sends when creating a new contact (first_name required).
- ContactUpdate: What the client sends when editing a contact (all fields optional).
- ContactResponse: What the API sends back (includes the generated id and from_attributes=True for ORM).
"""

from pydantic import BaseModel, EmailStr
from typing import Optional


# --- Base Schema ---
# Common fields shared across Contact models
class ContactBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    designation: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    lead_id: Optional[int] = None


# --- Schema for CREATING a contact ---
# Inherits from ContactBase. first_name is required.
class ContactCreate(ContactBase):
    pass


# --- Schema for UPDATING a contact ---
# All fields are optional so callers can patch only specific attributes
class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    designation: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    lead_id: Optional[int] = None


# --- Schema for RESPONSES ---
# Serializes database Contact models back to JSON
class ContactResponse(ContactBase):
    model_config = {"from_attributes": True}

    id: int
