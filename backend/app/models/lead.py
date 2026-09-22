"""
SQLAlchemy model for the 'leads' table in PostgreSQL.

What is a model?
----------------
A Pydantic schema (in schemas/lead.py) defines what data the API accepts.
A SQLAlchemy model (this file) defines what the database table looks like.

They have similar fields, but different jobs:
  - Schema  → validates incoming/outgoing JSON
  - Model   → maps to an actual PostgreSQL table with rows and columns

When you create a Lead model below, SQLAlchemy will create a table like:

  leads
  ┌────┬──────────────┬─────────────────────┬───────────────┬──────────────────┬──────────┬───────────┐
  │ id │ name         │ email               │ phone         │ company          │ source   │ status    │
  ├────┼──────────────┼─────────────────────┼───────────────┼──────────────────┼──────────┼───────────┤
  │  1 │ Priya Sharma │ priya@example.com   │ +91-987654321 │ TechVentures     │ facebook │ new       │
  │  2 │ Rahul Mehta  │ rahul@example.com   │ +91-912345678 │ GrowthBox        │ google   │ contacted │
  └────┴──────────────┴─────────────────────┴───────────────┴──────────────────┴──────────┴───────────┘
"""

from sqlalchemy import Column, Integer, String
from app.database import Base


class Lead(Base):
    """
    This class maps to the 'leads' table in PostgreSQL.

    Each attribute = one column in the table.
    Each instance of this class = one row in the table.
    """

    # The name of the table in PostgreSQL
    __tablename__ = "leads"

    # Columns
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)               # Required
    email = Column(String, nullable=True)                # Optional
    phone = Column(String, nullable=True)                # Optional
    company = Column(String, nullable=True)              # Optional
    source = Column(String, nullable=False, default="manual")  # Default: "manual"
    status = Column(String, nullable=False, default="new")     # Default: "new"
