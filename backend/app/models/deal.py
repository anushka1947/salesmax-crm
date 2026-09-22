"""
SQLAlchemy model for the 'deals' table in PostgreSQL.

What is a Deal?
----------------
A Deal represents a commercial sales opportunity progressing through a pipeline.
Stages:
  - New
  - Qualified
  - Proposal
  - Negotiation
  - Won
  - Lost
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime
from app.database import Base


class Deal(Base):
    """
    This class maps to the 'deals' table in PostgreSQL.
    Tracks deal value, pipeline stage, and relations to Leads or Contacts.
    """
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    value = Column(Float, nullable=False, default=0.0)  # Value in ₹ INR
    stage = Column(String, nullable=False, default="New")  # New, Qualified, Proposal, Negotiation, Won, Lost
    expected_close_date = Column(String, nullable=True)  # Format: YYYY-MM-DD

    # Relations
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
