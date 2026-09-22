"""
Pydantic schemas for Leads.

What is a schema?
-----------------
A schema defines the "shape" of data — what fields it has, what types they are,
and which ones are required. Think of it like a form template:
  - Name (text, required)
  - Email (email format, optional)
  - Phone (text, optional)

Pydantic checks the data for us automatically. If someone sends a lead
without a name, Pydantic will reject it and return a clear error message.
We don't have to write that validation code ourselves.

Why multiple schemas?
---------------------
- LeadCreate: What the user sends when creating a new lead (no id — we generate that).
- LeadUpdate: What the user sends when editing a lead (all fields optional — update only what changed).
- LeadResponse: What we send back to the user (includes the id we generated).
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class LeadSource(str, Enum):
    """Where the lead came from. Using an Enum means only these values are allowed."""
    manual = "manual"
    web_form = "web_form"
    facebook = "facebook"
    google = "google"
    referral = "referral"
    other = "other"


class LeadStatus(str, Enum):
    """Current status of the lead in the sales process."""
    new = "new"
    contacted = "contacted"
    qualified = "qualified"
    unqualified = "unqualified"
    converted = "converted"
    lost = "lost"


# --- Schema for CREATING a lead ---
# The user sends this when they want to add a new lead.
# 'name' is required. Everything else is optional.
class LeadCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: LeadSource = LeadSource.manual
    status: LeadStatus = LeadStatus.new


# --- Schema for UPDATING a lead ---
# All fields are optional because the user might only want to change one thing.
# For example, just update the status from "new" to "contacted".
class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[LeadSource] = None
    status: Optional[LeadStatus] = None


# --- Schema for the RESPONSE we send back ---
# This is what the API returns. It includes the 'id' that we generated.
#
# model_config with from_attributes=True tells Pydantic:
# "You'll receive a SQLAlchemy object (like lead.name), not a dict (like lead['name']).
# Read the data from object attributes instead."
class LeadResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: LeadSource
    status: LeadStatus

