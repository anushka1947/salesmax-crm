# SalesMax CRM — 2–3 Minute Presentation & Demo Script

This guide provides a crisp, professional script and step-by-step walkthrough to present the SalesMax CRM assignment demo effectively.

---

## Demo Overview

- **Product:** SalesMax CRM Replica (Web & Mobile Full-Stack Suite)
- **Time Required:** 2.5 to 3 Minutes
- **Key Message:** One unified PostgreSQL database and FastAPI backend driving both a desktop Next.js web application and a field-ready React Native mobile application with real-time cross-platform data synchronization.

---

## Preparation Before Demo

Open the following tabs in your browser:
1. **Web CRM:** `http://localhost:3000`
2. **Mobile CRM (Expo Web):** `http://localhost:8081` (or have your mobile emulator ready)
3. **Swagger API Docs:** `http://127.0.0.1:8000/docs`

---

## Step-by-Step Demo Script

### 1. Introduction (0:00 – 0:30)
> *"Hello! Today I'm presenting SalesMax CRM, a full-stack, cross-platform customer relationship management platform inspired by the workflows of SalesMax.ai.*
>
> *Our architecture consists of a high-performance Python FastAPI backend, a persistent PostgreSQL database, a desktop Next.js web portal, and a companion React Native mobile app built with Expo. Both web and mobile share the exact same backend and database, meaning any change made in one client immediately reflects in the other."*

### 2. Web CRM Walkthrough (0:30 – 1:15)
> *"Starting on the **Web Dashboard**, we see live analytics computed directly from PostgreSQL: total leads, active pipeline value (currently ₹6.5 Lakhs), win rate, and an automated activity stream.*
>
> *Let's jump into **Leads**: We have a full search-and-filter interface with status badges, lead scoring, and instant lead creation.*
>
> *Next is our **Sales Pipeline**: Here we see an intuitive Kanban board across all stages — New, Qualified, Proposal, Negotiation, Won, and Lost — with dynamic pipeline value totals per stage. Moving deals between stages updates the stage and recalculates conversion metrics instantly.*
>
> *In **Tasks & Follow-ups**, sales reps can track daily calls, WhatsApp follow-ups, and meetings, with instant completion toggles.*
>
> *We also have **Reports** for visual intelligence and an **Integrations Hub** showcasing connection status for WhatsApp Business, Meta Lead Ads, IndiaMART, and JustDial."*

### 3. Mobile CRM Tour (1:15 – 1:50)
> *"Now let's transition to the **Mobile CRM**, tailored for sales executives in the field.*
>
> *On the **Today** tab, reps have quick access to high-priority follow-ups and performance metrics.*
>
> *The **Leads** tab provides fast lookup with one-tap contact actions. The **Pipeline** tab allows stage progression on the go, and the **Tasks** tab ensures no customer follow-up is missed.*
>
> *Notice that all data shown on mobile is live data from the exact same PostgreSQL database."*

### 4. Live Cross-Platform Synchronization (1:50 – 2:30)
> *"To demonstrate end-to-end integration, let's perform a live cross-platform synchronization test:*
>
> 1. *On the **Mobile app**, tap the quick **'+' Add Lead** button.*
> 2. *Enter a new lead: Name: **'TechCorp India'**, Email: **'contact@techcorp.in'**, Phone: **'9876543210'**, Company: **'TechCorp Solutions'**, Source: **'Website'**.*
> 3. *Tap **'Create Lead'**.*
> 4. *Now switch immediately to the **Web CRM** on localhost:3000 and click on **Leads** (or refresh).*
> 5. *As you can see, **'TechCorp India'** appears instantly at the top of the table, saved permanently in PostgreSQL with an activity audit log generated.*
>
> *This confirms true end-to-end integration without mock data or client-side illusions."*

### 5. Conclusion & Architecture Wrap-Up (2:30 – 3:00)
> *"Behind the scenes, the FastAPI backend provides full OpenAPI Swagger documentation at `/docs`, with strict Pydantic data validation and SQLAlchemy ORM models.*
>
> *Both web and mobile clients are built with TypeScript, ensuring high code quality and type safety.*
>
> *Thank you! I'm happy to answer any technical or architectural questions."*

---

## Quick Reference Cards

| Feature | Where to Show |
| :--- | :--- |
| Live PostgreSQL Metrics | Web `http://localhost:3000` |
| Kanban Pipeline (₹6.5L) | Web `http://localhost:3000/pipeline` |
| Mobile Field View | Expo Web `http://localhost:8081` |
| Fast Mobile Quick-Add | Mobile `+` Floating Action Button |
| Real-time Synchronization | Mobile Create $\rightarrow$ Web Refresh |
| REST API & Schemas | Swagger `http://127.0.0.1:8000/docs` |
