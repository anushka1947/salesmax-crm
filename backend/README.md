# SalesMax CRM — Backend

The FastAPI backend for SalesMax CRM. Currently using in-memory storage (no database yet).

## Prerequisites

- **Python 3.11 or higher** — [Download from python.org](https://www.python.org/downloads/)
- When installing Python, **check the box** that says "Add Python to PATH"

## Setup (Windows — step by step)

Open **PowerShell** or **Terminal** and navigate to the backend folder:

```powershell
cd c:\Users\anush\OneDrive\Desktop\salesmax-crm\backend
```

### Step 1: Create a virtual environment

```powershell
python -m venv venv
```

> **What is a virtual environment?**
> It's an isolated copy of Python just for this project. Packages you install
> here won't affect other Python projects on your computer. Think of it like
> giving this project its own private toolbox.

### Step 2: Activate the virtual environment

```powershell
.\venv\Scripts\Activate
```

You'll see `(venv)` appear at the start of your terminal prompt. This means the virtual environment is active.

> **Troubleshooting:** If you get an error about "execution policies", run this command first:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```
> Then try activating again.

### Step 3: Install the required packages

```powershell
pip install -r requirements.txt
```

This reads `requirements.txt` and installs FastAPI, Uvicorn, and Pydantic.

### Step 4: Start the development server

```powershell
uvicorn app.main:app --reload
```

You should see output like:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

### Step 5: Open in your browser

| URL | What you'll see |
|-----|-----------------|
| http://127.0.0.1:8000 | `{"message": "SalesMax CRM API is running"}` |
| http://127.0.0.1:8000/docs | Interactive Swagger UI documentation |
| http://127.0.0.1:8000/api/health | `{"status": "healthy"}` |
| http://127.0.0.1:8000/api/leads | List of sample leads |

## Available Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/` | API running message |
| GET | `/api/health` | Health check |
| GET | `/api/leads` | Get all leads |
| GET | `/api/leads/{id}` | Get one lead |
| POST | `/api/leads` | Create a new lead |
| PUT | `/api/leads/{id}` | Update a lead |
| DELETE | `/api/leads/{id}` | Delete a lead |

## Stopping the Server

Press `Ctrl + C` in the terminal to stop the server.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py      ← Makes 'app' a Python package
│   ├── main.py          ← FastAPI app entry point
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── lead.py      ← Pydantic data schemas for leads
│   └── routers/
│       ├── __init__.py
│       └── leads.py     ← Lead API endpoints
├── requirements.txt     ← Python dependencies
└── README.md            ← This file
```
