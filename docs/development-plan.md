# SalesMax CRM: 7-Day MVP Development Plan

Welcome to the SalesMax CRM development plan. Building your first full-stack web and mobile application from scratch can feel overwhelming, but breaking the project down into focused, achievable milestones makes it completely manageable. This roadmap is designed specifically for beginner developers to build a working, production-style Minimum Viable Product (MVP) step-by-step.

> [!TIP]
> Remember: Each "Day" in this plan represents a focused development session, not necessarily a 24-hour calendar day. Take all the time you need to understand the concepts, test your code, and get comfortable with each layer.

---

## Tech Stack Architecture

SalesMax CRM uses a decoupled, modern architecture where both the web frontend and mobile client communicate with a single backend API:

- **Web Application**: Next.js (App Router), TypeScript, Tailwind CSS
- **Backend API**: Python 3.11+, FastAPI, SQLAlchemy ORM, Alembic
- **Database**: PostgreSQL
- **Mobile Application**: React Native with Expo, TypeScript
- **Authentication**: Stateless JSON Web Tokens (JWT) with bcrypt password hashing

```
   +-------------------+       +-----------------------+
   |  Next.js (Web)    |       |  React Native (Expo)  |
   +---------+---------+       +-----------+-----------+
             |                             |
             |     HTTP REST (JSON)        |
             +------------+----------------+
                          |
                          v
               +----------------------+
               |   FastAPI Backend    |
               +----------+-----------+
                          |
                          |  SQLAlchemy
                          v
               +----------------------+
               | PostgreSQL Database  |
               +----------------------+
```

---

## Overview & Guiding Principles

- **Primary Goal**: Build a functional MVP CRM with working leads, contacts, deals, tasks, and mobile access in 7 focused development sessions.
- **Must-Haves First**: Every day focuses strictly on core functionality before styling or edge cases.
- **Cumulative Progress**: Each milestone directly builds upon the foundations created in previous days.
- **Working Over Perfect**: Aim for a working feature end-to-end before polishing UI details.

---

## Day 1: Project Setup & Foundation

### Goal
Get your local environment fully configured, initialize all three sub-projects, and verify that the database and servers run without errors.

### Implementation Steps
1. **Initialize Git Repository**:
   - Run `git init` in the root directory.
   - Create a comprehensive `.gitignore` covering Node modules, Python virtual environments, and `.env` files.
2. **Setup Backend (`/backend`)**:
   - Create a Python virtual environment: `python -m venv venv`.
   - Install dependencies: `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `alembic`, `psycopg2-binary`, `pydantic-settings`.
   - Configure basic application entry point in `main.py` with CORS middleware.
3. **Setup Database (PostgreSQL)**:
   - Start a local PostgreSQL instance or Docker container.
   - Configure database URL in `/backend/.env`.
   - Initialize Alembic with `alembic init alembic`.
   - Create initial SQLAlchemy models for `User` and `Workspace`.
   - Generate and apply your first migration: `alembic upgrade head`.
4. **Setup Web Frontend (`/web`)**:
   - Initialize Next.js with TypeScript and Tailwind CSS: `npx create-next-app@latest web`.
   - Configure ESLint, Prettier, and environment variables in `.env.local`.
5. **Setup Mobile App (`/mobile`)**:
   - Initialize Expo project: `npx create-expo-app mobile --template blank-typescript`.
6. **Health Check Verification**:
   - Verify FastAPI interactive docs run at `http://localhost:8000/docs`.
   - Verify Next.js homepage loads at `http://localhost:3000`.
   - Verify Expo bundler starts and renders on your phone or emulator.

### Key Learning
You will learn about monorepo directory organization, Python virtual environments, database connection pooling, and how separate frontend and backend applications talk via HTTP.

### Deliverables Checklist
- [ ] All three applications (`/backend`, `/web`, `/mobile`) start cleanly without errors
- [ ] PostgreSQL database created with connected `User` and `Workspace` tables
- [ ] First Alembic migration successfully applied to the database

---

## Day 2: Authentication & User Management

### Goal
Implement secure user authentication so users can log in, receive JWT tokens, and access protected resources based on their roles.

### Implementation Steps
1. **FastAPI Auth Core**:
   - Implement password hashing using `passlib[bcrypt]`.
   - Create JWT utility module for encoding and decoding access and refresh tokens (`python-jose`).
   - Implement OAuth2 password bearer dependency in FastAPI to protect endpoints.
2. **Authentication Endpoints**:
   - `POST /api/v1/auth/login`: Validates email/password and returns access + refresh tokens.
   - `POST /api/v1/auth/refresh`: Issues fresh access tokens.
   - `GET /api/v1/auth/me`: Returns currently authenticated user profile.
   - `POST /api/v1/auth/logout`: Clears client session.
3. **Role-Based Access Control (RBAC)**:
   - Define user roles: `Admin`, `Manager`, `Sales Executive`.
   - Add role validation dependencies in FastAPI.
   - Build user CRUD endpoints accessible only by `Admin`.
   - Write a database seed script to generate a default admin account.
4. **Next.js Web Authentication**:
   - Build clean login page with email and password fields.
   - Create an `AuthContext` / `AuthProvider` to manage token storage, user state, and logout actions.
   - Create protected route wrappers or Next.js middleware to redirect unauthenticated visitors to `/login`.

### Key Learning
How token-based authentication works, how JWT tokens carry user identity securely, how headers pass authorization state, and how frontends handle protected routes.

### Deliverables Checklist
- [ ] User can log in through the Next.js web interface
- [ ] JWT tokens are securely stored and automatically attached to API calls
- [ ] Unauthenticated requests to protected pages redirect to `/login`
- [ ] Three distinct user roles working: Admin, Manager, and Sales Executive

---

## Day 3: Leads & Contacts Core

### Goal
Implement full CRUD (Create, Read, Update, Delete) functionality for leads and customer contacts from the database all the way to the web UI.

### Implementation Steps
1. **Data Modeling**:
   - Define SQLAlchemy models for `Lead` (name, company, email, phone, status, source, value, assigned_user_id).
   - Define SQLAlchemy models for `Contact` (first_name, last_name, email, phone, lead_id, company).
   - Generate and apply Alembic migration for new tables.
2. **Backend API Endpoints**:
   - Create standard CRUD routes: `GET`, `POST`, `PATCH`, `DELETE` for `/api/v1/leads`.
   - Create standard CRUD routes: `GET`, `POST`, `PATCH`, `DELETE` for `/api/v1/contacts`.
   - Implement query parameter filtering for leads (status, source, assigned user).
   - Implement lead assignment endpoint allowing managers to assign leads to sales reps.
3. **Web Interface - Leads**:
   - Create `/leads` page with a searchable, filterable data table.
   - Add status pill badges (e.g., New, Contacted, Qualified, Lost).
   - Build modal/drawer for creating a new lead with form validation.
   - Build lead detail page (`/leads/[id]`) showing profile information and owner.
4. **Web Interface - Contacts**:
   - Create `/contacts` listing page and contact creation modal.
   - Link contacts to associated leads and companies.

### Key Learning
The full-stack data lifecycle: submitting a frontend form, sending a JSON payload, validating with Pydantic, executing SQLAlchemy database queries, and rendering responsive UI state.

### Deliverables Checklist
- [ ] Can create, view, edit, and delete leads from the web UI
- [ ] Real-time search and multi-criteria filtering working on leads table
- [ ] Lead assignment to team members functional
- [ ] Contacts CRUD fully operational and linked to leads

---

## Day 4: Activity Timeline, Notes & Tasks

### Goal
Track customer relationship history by logging notes, scheduling follow-up tasks, and generating an automated activity timeline.

### Implementation Steps
1. **Data Models & Migration**:
   - `Activity`: Action type (call, email, meeting, status change), description, lead_id, user_id, timestamp.
   - `Note`: Rich text or markdown content, lead_id, user_id, timestamps.
   - `Task`: Title, description, due_date, priority (low, medium, high), status (pending, completed), lead_id, assigned_user_id.
   - Generate and run Alembic migration.
2. **Activity & Notes Engine**:
   - Create automatic activity hooks on lead updates (e.g., updating a lead's status automatically inserts an `Activity` record).
   - Implement CRUD endpoints for notes and tasks.
3. **Lead Detail Timeline UI**:
   - Build a vertical timeline component on `/leads/[id]` displaying chronological events.
   - Add a quick note-taking box allowing sales reps to log conversations instantly.
4. **Task Management System**:
   - Build dedicated `/tasks` page with tabbed views: "My Tasks", "Due Today", "Upcoming".
   - Implement quick checkbox toggle to mark tasks as completed.
   - Allow scheduling follow-up tasks directly from a lead's detail page.

### Key Learning
Relational data modeling, foreign keys, database indexing for timestamps, and building interactive timeline UI components.

### Deliverables Checklist
- [ ] Activity timeline displays on the lead detail page with automatic action logging
- [ ] Sales reps can add, edit, and view notes attached to leads
- [ ] Tasks can be created, edited, assigned, and marked complete
- [ ] Tasks filterable by status, priority, and due date

---

## Day 5: Deals & Kanban Pipeline

### Goal
Deliver a visual sales pipeline where reps can track commercial revenue and move deals across sales stages using drag-and-drop.

### Implementation Steps
1. **Pipeline & Deal Models**:
   - `PipelineStage`: Name, order, probability percentage.
   - `Deal`: Title, amount, currency, expected_close_date, stage_id, lead_id, contact_id, assigned_user_id.
   - Seed default sales stages: Discovery, Proposal Sent, Negotiation, Closed Won, Closed Lost.
2. **Pipeline Backend API**:
   - Implement CRUD endpoints for deals at `/api/v1/deals`.
   - Build aggregated pipeline endpoint: `GET /api/v1/pipeline/board` returning stages with nested deal arrays.
   - Create lightweight stage transition endpoint: `PATCH /api/v1/deals/{id}/stage`.
3. **Kanban Board UI**:
   - Install a modern drag-and-drop library (e.g., `@hello-pangea/dnd`).
   - Render horizontal columns for each pipeline stage showing total stage value.
   - Create deal cards showing deal title, monetary value, company name, and closing date.
   - Enable dragging cards between columns with optimistic UI updates and backend synchronization.
4. **Deal Detail View**:
   - Create `/deals/[id]` page linking back to relevant leads, contacts, and logged activities.

### Key Learning
Kanban board layout patterns, optimistic frontend updates for snappy drag-and-drop UX, and handling state synchronization when network errors occur.

### Deliverables Checklist
- [ ] Kanban board displaying deal cards grouped under proper pipeline stages
- [ ] Smooth drag-and-drop moving deals between stages with backend update
- [ ] Complete Deal CRUD operations working
- [ ] Deals properly linked to associated leads and contacts

---

## Day 6: Dashboard, Notifications & Polish

### Goal
Bring the platform together with executive summary metrics, notifications for critical events, and responsive layout polish.

### Implementation Steps
1. **Analytics & Dashboard API**:
   - Create `GET /api/v1/dashboard/metrics` returning: total pipeline value, won deals this month, new leads count, and pending tasks count.
   - Create recent activity feed endpoint aggregating the latest actions across the workspace.
2. **Dashboard UI**:
   - Build KPI metric cards with trend indicators.
   - Build recent activity feed widget and high-priority tasks widget.
   - Customize view depending on role (Admins see team-wide figures; Sales Reps see personal stats).
3. **In-App Notification Center**:
   - Create `Notification` model and endpoints: `GET /api/v1/notifications` and `PATCH /api/v1/notifications/{id}/read`.
   - Trigger notifications when: a lead is assigned to a user, a task is due, or a deal stage changes.
   - Add notification bell icon in the top navigation bar with unread count badge and dropdown drawer.
4. **UX & Responsive Polish**:
   - Implement consistent responsive navigation sidebar with collapsible mobile menu.
   - Add loading skeleton states during data fetches.
   - Integrate toast notifications for success/error feedback (e.g., `sonner` or `react-hot-toast`).

### Key Learning
Aggregating SQL queries for performance metrics, designing responsive layouts with Tailwind CSS, and implementing user feedback mechanisms (toasts and notification badges).

### Deliverables Checklist
- [ ] Executive dashboard showing key business metrics and recent activity
- [ ] Working notification bell and dropdown with unread status indicators
- [ ] Responsive web design supporting desktop, tablet, and mobile browsers
- [ ] Polished navigation sidebar, loading skeletons, and action toast alerts

---

## Day 7: Mobile App & Final Integration

### Goal
Build a companion React Native mobile app using Expo, connect it to the same FastAPI backend, and verify cross-platform data consistency.

### Implementation Steps
1. **Navigation Setup**:
   - Configure React Navigation with a Bottom Tab Navigator (Leads, Tasks, Profile) and Stack Navigator for detail screens.
2. **Authentication Flow**:
   - Build mobile login screen consuming `/api/v1/auth/login`.
   - Store JWT securely on device using `expo-secure-store`.
   - Create global auth state for session persistence across app restarts.
3. **Mobile Features**:
   - **Leads Screen**: Scrollable list of leads with search bar and status badges.
   - **Lead Detail Screen**: Key contact details, quick tap-to-call and tap-to-email actions.
   - **Add Lead Screen**: Quick form modal to create leads on the go.
   - **Tasks Screen**: Checklist of assigned tasks with toggle completion button.
4. **End-to-End Cross-Platform Verification**:
   - Log into web and mobile with the same credentials.
   - Create a lead on the mobile app, confirm it instantly appears on the web dashboard.
   - Update a deal or task on the web app, confirm updates reflect on mobile.
5. **Bug Squashing & Clean Up**:
   - Review network error handling on both platforms.
   - Clean up console logs, dead code, and ensure clean repository commit history.

### Key Learning
Mobile app lifecycle, shared API consumption between web and native devices, secure storage on mobile, and end-to-end integration testing.

### Deliverables Checklist
- [ ] Mobile app authenticates users against FastAPI backend
- [ ] Users can browse, search, and add leads directly from their phone
- [ ] Users can review and complete daily tasks on mobile
- [ ] Seamless real-time data parity between web and mobile interfaces

---

## Post-MVP Roadmap

Once the 7-day core MVP is up and running, expand your CRM in structured weekly iterations:

### Week 2: Communication & Reporting
- Click-to-call integration and telephony webhook logging
- WhatsApp Business API integration for customer chat
- CSV lead export and bulk import wizard
- Custom sales performance reports and conversion funnels

### Week 3: Billing & External Ingestion
- Quote and proposal generator (PDF creation)
- Payment tracking and Stripe invoice integration
- Public website contact form embed / lead capture webhook
- Email synchronization (IMAP/SMTP logging)

### Week 4: Automation & AI Features
- Automated lead assignment rules (round-robin distribution)
- Automatic email follow-up sequences
- AI-powered lead scoring and deal win-probability prediction
- AI summary generator for long note threads and call transcripts

### Ongoing: Hardening & Scale
- Comprehensive unit and integration test suite (pytest + Playwright)
- Docker containerization and production deployment scripts
- Database indexing optimization and Redis caching layer
- Security audit, rate limiting, and automated backups

---

## Essential Developer Tools

| Tool | Purpose | Recommended Choice |
| :--- | :--- | :--- |
| Code Editor | Primary code authoring and debugging | VS Code with Python & Prettier plugins |
| API Testing | Interactive API exploration and debugging | FastAPI Built-in Swagger (`/docs`) or Postman |
| Database Viewer | Visual schema inspection and raw SQL testing | DBeaver Community or pgAdmin 4 |
| Version Control | Source code tracking and branch management | Git with GitHub or GitLab |
| Terminal | Running services and management scripts | Windows Terminal with PowerShell |
| Browser Tools | Inspecting network payloads and responsive layouts | Chrome or Edge DevTools |

---

## Beginner Tips for Success & Debugging Mindset

1. **Don't Aim for Perfection on Day 1**: Your primary target is working software. Write simple code that works, verify it, and optimize later.
2. **Commit Frequently**: Commit your progress to Git at least at the end of each session, or whenever a single sub-task is completed. Good commit messages make rollbacks painless.
3. **Learn to Read Error Logs**: When an error occurs, resist the urge to panic. Read the stack trace from the bottom up. Most errors clearly state the exact file, line number, and issue.
4. **Rely on Interactive Docs**: FastAPI provides automatic interactive documentation at `http://localhost:8000/docs`. Always test backend endpoints here before writing frontend fetch code.
5. **Debug Visually**: In frontend code, use `console.log()` to check the shape of received API data. In backend code, use Python's `print()` or logging to verify incoming request bodies.
6. **Simplify When Stuck**: If a feature or library is taking too long to configure, strip it down to its most basic working version, make it functional, and keep moving forward.
