"""
SQLAlchemy model for the 'contacts' table in PostgreSQL.

What is a Contact?
------------------
In a CRM:
- A Lead is a raw inquiry or potential prospect (e.g. from an ad or web form).
- A Contact is a confirmed person/customer with known business details.

A Contact can optionally originate from a Lead (via lead_id foreign key).
"""

from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Contact(Base):
    """
    This class maps to the 'contacts' table in PostgreSQL.
    Each attribute corresponds to a database column.
    """
    __tablename__ = "contacts"

    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Contact details
    first_name = Column(String, nullable=False)          # Required
    last_name = Column(String, nullable=True)            # Optional
    email = Column(String, nullable=True, index=True)    # Optional, indexed for fast lookups
    phone = Column(String, nullable=True)                # Optional
    company_name = Column(String, nullable=True)         # Optional
    designation = Column(String, nullable=True)          # e.g., "CTO", "Procurement Head"

    # Address fields
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    pincode = Column(String, nullable=True)

    # Relationship to originating Lead (optional)
    # If this contact was converted from a lead, lead_id points to leads.id
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
