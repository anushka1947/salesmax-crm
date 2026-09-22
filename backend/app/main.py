"""
main.py — The entry point of our FastAPI application.

This is where the app starts. When you run:
    uvicorn app.main:app --reload

Python loads this file, creates the FastAPI app, and starts listening
for HTTP requests on http://127.0.0.1:8000

What does each part of that command mean?
  - uvicorn          → The web server that runs our app
  - app.main         → Look in the 'app' folder, find 'main.py'
  - :app             → Inside that file, use the variable called 'app'
  - --reload         → Auto-restart when you save code changes (dev only)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import leads, contacts, deals, tasks, activities, dashboard
from app.database import engine, Base

# Import all models so Base.metadata.create_all discovers them and creates tables
from app.models.lead import Lead          # noqa: F401
from app.models.contact import Contact    # noqa: F401
from app.models.deal import Deal          # noqa: F401
from app.models.task import Task          # noqa: F401
from app.models.activity import Activity  # noqa: F401

# ---------------------------------------------------------------------------
# AUTO-CREATE DATABASE TABLES
# ---------------------------------------------------------------------------
# This checks PostgreSQL and creates any tables that don't exist yet.
# If tables already exist, it does nothing (safe to run repeatedly).

Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# CREATE THE APP
# ---------------------------------------------------------------------------

app = FastAPI(
    title="SalesMax CRM API",
    description=(
        "A beginner-friendly CRM backend built with FastAPI. "
        "This API manages leads, contacts, deals, tasks, and sales pipelines."
    ),
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# CORS MIDDLEWARE (Cross-Origin Resource Sharing)
#
# Allows Next.js web (localhost:3000) and React Native mobile clients
# to make API requests to this FastAPI backend without browser blocking.
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# REGISTER ROUTERS
# ---------------------------------------------------------------------------

app.include_router(leads.router)
app.include_router(contacts.router)
app.include_router(deals.router)
app.include_router(tasks.router)
app.include_router(activities.router)
app.include_router(dashboard.router)

# ---------------------------------------------------------------------------
# ROOT & HEALTH ENDPOINTS
#
# These are simple endpoints that don't belong to any specific feature.
# They're useful for checking if the server is running.
# ---------------------------------------------------------------------------


@app.get(
    "/",
    tags=["General"],
    summary="Root endpoint",
    description="Returns a simple message confirming the API is running.",
)
def root():
    """
    GET /

    This is the simplest possible endpoint. When someone visits
    http://127.0.0.1:8000/ in their browser, they'll see this response.
    """
    return {"message": "SalesMax CRM API is running"}


@app.get(
    "/api/health",
    tags=["General"],
    summary="Health check",
    description="Returns the health status of the API. Used by monitoring tools.",
)
def health_check():
    """
    GET /api/health

    Health checks are a common pattern. Monitoring tools (or deployment
    platforms) call this endpoint every few seconds to make sure the
    server is alive and responding.
    """
    return {"status": "healthy"}
