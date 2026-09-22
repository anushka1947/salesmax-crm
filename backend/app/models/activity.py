"""
SQLAlchemy model for the 'activities' table in PostgreSQL.

What is an Activity?
--------------------
An Activity represents an event in the chronological timeline of a lead or contact.
Examples:
  - Call logged (connected, callback requested, duration)
  - WhatsApp message sent
  - Deal stage changed
  - Task created / completed
  - Manual note added
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.database import Base


class Activity(Base):
    """
    This class maps to the 'activities' table in PostgreSQL.
    Provides the central activity stream / timeline.
    """
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    type = Column(String, nullable=False)  # call, whatsapp, note, stage_change, lead_created, contact_created, task_completed
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)

    # Relations
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
