"""
database.py — SQLAlchemy database connection configuration.

This file sets up:
  1. engine       → The connection to PostgreSQL with pool resilience (pool_pre_ping=True)
  2. SessionLocal → A factory that creates database sessions
  3. Base         → The declarative base class that all ORM models inherit from

Production & Cloud Deployment Support:
--------------------------------------
Supports DATABASE_URL injected by Render, Neon, Supabase, etc.
Handles Render's 'postgres://' URI scheme by normalizing to 'postgresql+psycopg2://'.
In local development, loads credentials from backend/.env or discrete environment variables.
"""

import os
from pathlib import Path
# Load environment variables from backend/.env or cwd (if python-dotenv is installed)
try:
    from dotenv import load_dotenv
    BASE_DIR = Path(__file__).resolve().parent.parent
    load_dotenv(dotenv_path=BASE_DIR / ".env")
    load_dotenv()
except ImportError:
    pass

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, declarative_base


# ---------------------------------------------------------------------------
# DATABASE CONNECTION URL RESOLUTION
# ---------------------------------------------------------------------------
raw_db_url = os.getenv("DATABASE_URL")

if raw_db_url:
    # Render and other cloud providers often provide 'postgres://...'
    # SQLAlchemy 2.0 with psycopg2 requires 'postgresql+psycopg2://...' or 'postgresql://...'
    if raw_db_url.startswith("postgres://"):
        DATABASE_URL = raw_db_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif raw_db_url.startswith("postgresql://") and not raw_db_url.startswith("postgresql+psycopg2://"):
        DATABASE_URL = raw_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    else:
        DATABASE_URL = raw_db_url
else:
    # Discrete parameter fallback (from .env or system environment)
    pg_user = os.getenv("POSTGRES_USER", "postgres")
    pg_password = os.getenv("POSTGRES_PASSWORD", "")
    pg_host = os.getenv("POSTGRES_HOST", "127.0.0.1")
    pg_port = int(os.getenv("POSTGRES_PORT", "5432"))
    pg_db = os.getenv("POSTGRES_DB", "salesmax")

    DATABASE_URL = URL.create(
        drivername="postgresql+psycopg2",
        username=pg_user,
        password=pg_password,
        host=pg_host,
        port=pg_port,
        database=pg_db,
    )

# ---------------------------------------------------------------------------
# ENGINE
# ---------------------------------------------------------------------------
# pool_pre_ping=True verifies connection liveliness before issuing queries,
# preventing stale-connection drops during periods of inactivity on cloud hosts.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# ---------------------------------------------------------------------------
# SESSION FACTORY
# ---------------------------------------------------------------------------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ---------------------------------------------------------------------------
# BASE CLASS
# ---------------------------------------------------------------------------
Base = declarative_base()