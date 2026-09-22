"""
database.py — SQLAlchemy database connection configuration.

This file sets up three things:
  1. engine       → The connection to PostgreSQL (like opening a phone line)
  2. SessionLocal → A factory that creates database sessions (like individual calls)
  3. Base         → The base class that all our database models will inherit from

Why URL.create() instead of a plain string?
-------------------------------------------
A normal connection string looks like:
    postgresql+psycopg2://postgres:mypassword@127.0.0.1:5432/salesmax

But if your password contains special characters like @ or / or #,
the string breaks because those characters have special meaning in URLs.

URL.create() handles this safely by encoding the password for you.
"""

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, declarative_base

# ---------------------------------------------------------------------------
# DATABASE CONNECTION URL
# ---------------------------------------------------------------------------
# Using URL.create() so that special characters in the password (like @)
# are handled correctly without manual URL-encoding.
#
# ⚠️  Replace "YOUR_POSTGRES_PASSWORD" with your actual PostgreSQL password.
# ---------------------------------------------------------------------------

DATABASE_URL = URL.create(
    drivername="postgresql+psycopg2",
    username="postgres",
    password="deepa1978@",
    host="127.0.0.1",
    port=5432,
    database="salesmax",
)
# ---------------------------------------------------------------------------
# ENGINE
# ---------------------------------------------------------------------------
# The engine is the starting point for any SQLAlchemy application.
# It maintains a pool of database connections that can be reused,
# so we don't open a brand-new connection for every single request.

engine = create_engine(DATABASE_URL)

# ---------------------------------------------------------------------------
# SESSION FACTORY
# ---------------------------------------------------------------------------
# A "session" is a conversation with the database. You open one, do some
# reads/writes, and then close it.
#
# - autocommit=False → We control when changes are saved (committed).
# - autoflush=False  → We control when data is sent to the database.
# - bind=engine      → Sessions use our PostgreSQL connection.

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ---------------------------------------------------------------------------
# BASE CLASS
# ---------------------------------------------------------------------------
# Every database model (User, Lead, Deal, etc.) will inherit from this Base.
# It gives them the ability to map Python classes to PostgreSQL tables.

Base = declarative_base()