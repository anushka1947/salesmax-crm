# SalesMax CRM

A full-stack, cross-platform Customer Relationship Management (CRM) platform inspired by the design and operational patterns of [SalesMax.ai](https://salesmax.ai/).

SalesMax CRM provides an end-to-end solution featuring a **FastAPI** backend, a **PostgreSQL** database, a desktop **Next.js** web application, and a **React Native (Expo)** mobile application. Both web and mobile applications connect to the same backend API and PostgreSQL database, providing real-time data persistence and bi-directional synchronization.

---

## System Architecture

```
                      ┌─────────────────────────────────────────┐
                      │          PostgreSQL Database            │
                      │          (Database: "salesmax")         │
                      └────────────────────▲────────────────────┘
                                           │
                                    SQLAlchemy ORM
                                           │
                      ┌────────────────────▼────────────────────┐
                      │          FastAPI REST API               │
                      │       http://127.0.0.1:8000             │
                      │    Swagger UI: /docs | ReDoc: /redoc    │
                      └──────────────▲───────────────────▲──────┘
                                     │                   │
                  JSON HTTP Requests │                   │ JSON HTTP Requests
                                     │                   │
        ┌────────────────────────────▼────┐         ┌────▼────────────────────────────┐
        │       Next.js 14 Web CRM        │         │   React Native (Expo) Mobile    │
        │      http://localhost:3000      │         │      http://localhost:8081      │
        │   Desktop / Manager Portal      │         │      Field Sales Companion      │
        └─────────────────────────────────┘         └─────────────────────────────────┘
```

Both clients communicate with the same REST API. Any entity created or modified on mobile is instantly stored in PostgreSQL and displayed on the web dashboard upon refresh, and vice versa.

---

## Key Features

### 1. Backend Core & Database
- **FastAPI REST API**: High-performance asynchronous API with automatic OpenAPI Swagger documentation.
- **PostgreSQL Persistence**: Robust relational persistence via SQLAlchemy ORM with automatic schema initialization.
- **Leads CRUD**: Comprehensive lead capture, scoring, status tracking, search, and filtering.
- **Contacts Management**: Full contact details linked directly to parent leads.
- **Deals & Sales Pipeline**: Multi-stage sales tracking (`New`, `Qualified`, `Proposal`, `Negotiation`, `Won`, `Lost`) with stage transition endpoints.
- **Tasks & Follow-ups**: Follow-up scheduling with type classification (Call, WhatsApp, Email, Meeting), priority levels, and completion status.
- **Activity Timeline**: Automated audit logging of actions and updates across the system.
- **Dashboard & Intelligence Stats**: Real-time aggregated pipeline metrics, win rates, pending task counts, and stage distribution.

### 2. Web CRM (Next.js 14)
- **Executive Dashboard**: Live KPI cards, conversion win rates, recent activities timeline, and quick-add actions.
- **Leads Portal**: Searchable, filterable table with status badges and full modal create/edit dialogs.
- **Visual Kanban Pipeline**: Drag-style stage columns with dynamic deal count and aggregate value calculations in INR (₹).
- **Tasks Manager**: Unified list with one-click completion toggle and deadline urgency indicators.
- **Contacts Directory**: Customer records linked to parent leads and companies.
- **Reports & Analytics**: Pipeline stage breakdown, win/loss analytics, and revenue forecasting.
- **Integrations Center**: Simulated connection hub for WhatsApp, Meta Ads, IndiaMART, and JustDial.

### 3. Mobile CRM (React Native Expo)
- **Today Dashboard**: Mobile-optimized daily briefing with active deal counts, pipeline value, and urgent tasks.
- **Field Leads View**: Fast contact access with one-tap dialer and email shortcuts.
- **Mobile Pipeline**: Card-based stage progression view tailored for mobile interactions.
- **Mobile Tasks**: Swipe-friendly task list with instant check-off.
- **Quick-Add Floating Action Button**: Instant bottom-sheet modal to capture leads on the go.
- **Server Health Inspector**: Built-in settings view to monitor API status and switch connection endpoints.

---

## Development & Access URLs

| Component | URL | Notes |
| :--- | :--- | :--- |
| **FastAPI Backend** | `http://127.0.0.1:8000` | Root endpoint returns health status |
| **Interactive API Docs (Swagger)** | `http://127.0.0.1:8000/docs` | Interactive OpenAPI documentation |
| **ReDoc API Documentation** | `http://127.0.0.1:8000/redoc` | Alternative API reference |
| **Web CRM Application** | `http://localhost:3000` | Next.js 14 web client |
| **Mobile CRM (Expo Web)** | `http://localhost:8081` | React Native web preview |

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2, psycopg2-binary |
| **Database** | PostgreSQL 15+ |
| **Web Client** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React |
| **Mobile Client** | React Native 0.74, Expo SDK 51, React Navigation v6, TypeScript |

---

## Repository Structure

```
salesmax-crm/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── models/           # SQLAlchemy ORM models (lead, contact, deal, task, activity)
│   │   ├── routers/          # API route handlers
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── database.py       # SQLAlchemy engine and session configuration
│   │   └── main.py           # FastAPI entry point & CORS configuration
│   ├── requirements.txt      # Python package dependencies
│   └── README.md
├── web/                      # Next.js 14 web application
│   ├── src/
│   │   ├── app/              # Next.js App Router pages (Dashboard, Leads, Pipeline, etc.)
│   │   ├── components/       # Reusable UI components (Sidebar, Topbar, Modals)
│   │   ├── lib/              # API client and utility helpers
│   │   └── types/            # TypeScript interfaces
│   ├── package.json
│   └── tailwind.config.ts
├── mobile/                   # React Native (Expo) mobile application
│   ├── src/
│   │   ├── screens/          # Screens (HomeScreen, LeadsScreen, PipelineScreen, etc.)
│   │   ├── components/       # QuickAddModal, Navigation components
│   │   ├── services/         # API integration client
│   │   └── types/            # Mobile TypeScript models
│   ├── App.tsx               # App root and navigation setup
│   ├── app.json              # Expo application configuration
│   └── package.json
├── docs/                     # Project documentation & guides
│   ├── DEMO.md               # 2–3 minute presentation and demo script
│   ├── TESTING.md            # Verified test cases and cross-platform reports
│   ├── architecture.md       # Detailed system design
│   ├── database-design.md    # Database schemas and entity relationships
│   └── api-design.md         # REST API contract definitions
├── .gitignore
└── README.md
```

---

## Setup & Installation Instructions

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**
- **PostgreSQL 15+** installed and running locally

---

### 1. PostgreSQL Database Setup

1. Open `psql` or pgAdmin and create a database named `salesmax`:
   ```sql
   CREATE DATABASE salesmax;
   ```
2. Verify that PostgreSQL is listening on `127.0.0.1:5432`.
3. The database connection string in `backend/app/database.py` is configured for the `postgres` user on `localhost:5432`.
   > *Note: Database tables are created automatically by SQLAlchemy when the FastAPI server boots up.*

---

### 2. Backend Setup (FastAPI)

1. Open a terminal in the `backend/` folder:
   ```powershell
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```powershell
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
3. Install required Python packages:
   ```powershell
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```powershell
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
5. Verify the backend:
   - Status check: `http://127.0.0.1:8000/api/health`
   - Swagger documentation: `http://127.0.0.1:8000/docs`

---

### 3. Web CRM Setup (Next.js 14)

1. Open a terminal in the `web/` folder:
   ```powershell
   cd web
   ```
2. Install npm dependencies:
   ```powershell
   npm install
   ```
3. *(Optional)* Verify or customize the backend URL in `web/.env.example` by creating `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```
4. Start the Next.js development server:
   ```powershell
   npm run dev
   ```
5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

### 4. Mobile CRM Setup (React Native Expo)

1. Open a terminal in the `mobile/` folder:
   ```powershell
   cd mobile
   ```
2. Install npm dependencies:
   ```powershell
   npm install
   ```

#### Mobile API Configuration:
The mobile application uses the `EXPO_PUBLIC_API_URL` environment variable configured in `mobile/.env`. Choose the appropriate URL based on your target:

| Platform | Configuration | Command |
| :--- | :--- | :--- |
| **Expo Web (Browser)** | `EXPO_PUBLIC_API_URL=http://127.0.0.1:8000` | `npx expo start --web` |
| **Android Emulator** | `EXPO_PUBLIC_API_URL=http://10.0.2.2:8000` | `npx expo start --android` |
| **Physical Phone (Wi-Fi)** | `EXPO_PUBLIC_API_URL=http://<YOUR_PC_LAN_IP>:8000` | `npx expo start` |

> **Tip for Physical Device Testing:**
> When running on a physical phone over local Wi-Fi, start the backend with:
> `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
> and set `EXPO_PUBLIC_API_URL=http://<YOUR_PC_LAN_IP>:8000` in `mobile/.env`.

3. Start the mobile app on web:
   ```powershell
   npx expo start --web --clear
   ```
4. Access the mobile app preview at `http://localhost:8081`.

---

## Recommended Demo Flow

Follow this sequence for presenting a complete end-to-end demonstration:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. Web CRM  │ ──► │ 2. Leads &   │ ──► │  3. Tasks &  │ ──► │  4. Reports  │
│  Dashboard   │     │   Pipeline   │     │  Follow-ups  │     │ & Integration│
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│7. Synchronize│ ◄── │6. Create Lead│ ◄── │5. Open Mobile│ ◄──────────┘
│ Refresh Web  │     │  on Mobile   │     │  Application │
└──────────────┘     └──────────────┘     └──────────────┘
```

1. **Dashboard Overview (`/`)**: View live PostgreSQL metrics (Leads count, ₹6.5 Lakh active pipeline, conversion rate, and activity feed).
2. **Leads Management (`/leads`)**: Demonstrate lead searching, filtering by status, and inspection of lead details.
3. **Sales Pipeline (`/pipeline`)**: Show the Kanban board, stage value totals, and move a deal between stages.
4. **Tasks & Follow-ups (`/tasks`)**: Toggle completion on a task and view priority indicators.
5. **Reports & Integrations (`/reports`, `/integrations`)**: Show analytics breakdown and the third-party integrations status.
6. **Mobile Field CRM (`http://localhost:8081`)**: Navigate the mobile app's Today, Leads, Pipeline, and Tasks tabs.
7. **End-to-End Live Sync**:
   - Tap the `+` button on mobile and create a lead (e.g., *"Apex Logistics"*).
   - Switch to the Web CRM Leads page and refresh.
   - Observe the newly created lead appearing instantly on the web table, directly fetched from PostgreSQL.

*(See [docs/DEMO.md](docs/DEMO.md) for the complete 2–3 minute spoken presentation script).*

---

## Cross-Platform Data Synchronization

SalesMax CRM does not rely on mocked client-side state. Both the Next.js web application and the React Native mobile application query the same FastAPI endpoints:

- **Single Source of Truth**: All CRUD operations write directly to PostgreSQL.
- **Unified Schemas**: Consistent Pydantic and TypeScript data models guarantee data integrity.
- **Bi-Directional Reflection**: Any update made via mobile (such as lead capture or task completion) is immediately queryable on the web application.

---

## Integration Limitations & Demo Mode

The CRM includes pre-built integration modules for popular business channels:
- **WhatsApp Business API**: Customer messaging and template follow-ups.
- **Meta Lead Ads**: Automatic capture of Facebook/Instagram campaign leads.
- **IndiaMART**: B2B buyer inquiries ingestion.
- **JustDial**: Local service leads sync.

> **Important Note on External Integrations:**
> Third-party integrations in this demo environment operate in **simulation/demo-ready mode**. Real production usage requires proprietary API tokens, verified business accounts, and registered webhooks with Meta, IndiaMART, JustDial, and Meta Cloud API providers. The user interface accurately models the real-world connection status, simulated payload receipts, and webhook logs.

---

## Verification & Testing Summary

All features have been tested and verified:
- **Backend API**: All endpoints passed (`200 OK` / `201 Created` / `204 No Content`).
- **PostgreSQL Persistence**: Verified through full server restarts without data loss.
- **Type Safety**: TypeScript compilers passed cleanly with zero errors on both Web (`web/`) and Mobile (`mobile/`).
- **Mobile Runtime**: Expo SDK 51 web compilation bundled 522 modules without console errors.

Detailed test logs and verification matrices can be found in [docs/TESTING.md](docs/TESTING.md).

---

## Submission Checklist

- [x] Python FastAPI backend running with SQLAlchemy and PostgreSQL.
- [x] Complete CRUD for Leads, Contacts, Deals, Tasks, Activities, and Dashboard Stats.
- [x] Interactive OpenAPI Swagger documentation active at `/docs`.
- [x] Next.js 14 responsive web CRM with Tailwind CSS and Lucide icons.
- [x] React Native Expo mobile CRM with unified navigation and quick-add modal.
- [x] Verified cross-platform synchronization between mobile and web.
- [x] Comprehensive documentation in `README.md`, `docs/DEMO.md`, and `docs/TESTING.md`.
- [x] Clean `.gitignore` protecting environments, dependencies, and build artifacts.
