"""
SQLAlchemy model for the 'tasks' table in PostgreSQL.

What is a Task?
----------------
A Task represents a to-do item or follow-up activity for a sales rep.
Types:
  - Call
  - WhatsApp
  - Email
  - Meeting
Statuses:
  - Pending
  - Completed
Priorities:
  - Low
  - Medium
  - High
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.database import Base


class Task(Base):
    """
    This class maps to the 'tasks' table in PostgreSQL.
    """
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False, default="Call")  # Call, WhatsApp, Email, Meeting
    due_date = Column(String, nullable=True)  # Format: YYYY-MM-DD
    priority = Column(String, nullable=False, default="Medium")  # Low, Medium, High
    status = Column(String, nullable=False, default="Pending")  # Pending, Completed

    # Relations
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
