# SalesMax CRM Architecture Guide

Welcome to the **SalesMax CRM** architecture guide! If you are a fresher or just starting your journey into software engineering, this document was created specifically for you. Building a modern software application can feel overwhelming with all the buzzwords and tools. This guide breaks down the design of SalesMax CRM step-by-step using plain language, intuitive real-world analogies, and practical examples.

---

## 1. System Overview

SalesMax CRM is a Customer Relationship Management system designed to help sales teams track leads, manage customer interactions, and close deals efficiently.

The system is split into multiple parts that work together in harmony.

### High-Level Architecture Diagram

```text
+-------------------------+        +--------------------------+
|   Next.js Web App       |        |   React Native App       |
|   (Browser / Desktop)   |        |   (iOS & Android Phones) |
+------------+------------+        +------------+-------------+
             |                                  |
             |       HTTP / REST (JSON)         |
             +----------------+-----------------+
                              |
                              v
                 +--------------------------+
                 |    FastAPI Backend API   |
                 |     (Python Service)     |
                 +------------+-------------+
                              |
                              |  SQLAlchemy ORM (SQL)
                              v
                 +--------------------------+
                 |    PostgreSQL Database   |
                 |  (Persistent Data Store) |
                 +--------------------------+
```

### The 3-Tier Architecture Pattern

SalesMax CRM follows the classic **3-Tier Architecture**:

1. **Tier 1: Presentation Tier (The Client / Frontend)**
   - What the user interacts with directly: our Next.js web application and React Native mobile application.
   - Its primary responsibility is collecting user input and displaying data clearly.
2. **Tier 2: Application Tier (The Server / Backend)**
   - The brain of the application powered by FastAPI (Python).
   - It validates incoming information, enforces business rules, verifies security permissions, and performs business calculations.
3. **Tier 3: Data Tier (The Database)**
   - The permanent storage managed by PostgreSQL.
   - It safely stores customer records, deals, and user accounts so nothing is lost when the server restarts.

### Why Share One Backend Between Web and Mobile?

Instead of building one backend for the website and a separate backend for the mobile app, both clients communicate with the exact same FastAPI backend.

- **Single Source of Truth:** Business rules (such as *"A deal value cannot be negative"*) are written once in Python, rather than duplicated across JavaScript and mobile code.
- **Easier Maintenance:** If we add a new feature or fix a bug in how leads are calculated, both web and mobile users get the updated behavior immediately without changing backend logic twice.
- **Consistency:** Both platforms see the exact same data in real time.

---

## 2. What is a Frontend?

The **frontend** (also called the *client*) is everything the user sees, clicks, touches, and reads on their screen.

> **The Restaurant Menu Analogy:**
> When you visit a restaurant, you sit at a table and look at a beautifully designed menu. You choose what you want, point to an item, and receive your food on a plate. You do not step inside the kitchen to cut vegetables or light the stove. The frontend is that clean, comfortable dining area and printed menu.

Our system provides two frontends: a Web App and a Mobile App.

### Web Frontend Stack

- **Next.js:** A framework built on top of React. React lets you build reusable UI blocks (called components, like buttons and forms). Next.js enhances React by providing built-in page routing and Server-Side Rendering (SSR). With SSR, pages can be pre-built on the server for faster load times and better search engine visibility.
- **TypeScript:** JavaScript is the native language of web browsers, but it does not strictly enforce variable types (for example, accidentally adding text to a number). TypeScript adds types to JavaScript, catching syntax and type errors while you type code in your editor before you ever run the app.
- **Tailwind CSS:** Styling web pages traditionally required switching between HTML files and large CSS style sheets. Tailwind CSS is a utility-first styling tool that allows you to style elements directly inside your markup using short helper classes (such as `bg-blue-500`, `p-4`, `flex`, `text-center`).

### Mobile Frontend Stack

- **React Native:** Rather than learning Swift for Apple iOS and Kotlin for Google Android, React Native lets developers write one shared codebase using React and JavaScript that compiles directly to genuine native mobile controls on both platforms.
- **Expo:** A developer tool suite built on React Native. Expo provides ready-to-use libraries (camera access, secure storage, push notifications) and simplifies running and previewing apps on physical devices.

---

## 3. What is a Backend?

The **backend** (also called the *server*) runs on a computer in the cloud or on a local development server. Users never see the backend directly.

> **The Kitchen Analogy:**
> Continuing our restaurant analogy, the backend is the kitchen. When the customer picks a dish from the menu, the order is passed to the kitchen. The chef checks if the ingredients are available, follows the recipe rules (cooking times, hygiene requirements), and prepares the meal.

### Our Backend Stack

- **Python:** One of the most popular and readable programming languages in the world. Its clean syntax reads almost like everyday English, making it ideal for beginners and enterprise teams alike.
- **FastAPI:** A modern, high-performance web framework for Python. It automatically validates incoming data using Python type hints and generates interactive documentation pages (Swagger UI) where you can test API endpoints directly from your browser.

### Key Backend Responsibilities

1. **Data Validation:** Checks that the data sent by the user makes sense (e.g., verifying an email address contains an `@` symbol before saving it).
2. **Business Rule Enforcement:** Enforces business logic (e.g., *"Only managers can mark a deal as Closed-Won"*).
3. **Database Communication:** Reads and writes information to PostgreSQL safely.
4. **Authentication & Security:** Checks user passwords, issues security tokens, and prevents unauthorized access.

---

## 4. What is an API?

**API** stands for *Application Programming Interface*. It is the bridge that allows the frontend and the backend to talk to each other.

> **The Waiter Analogy:**
> The frontend is the customer at the table. The backend is the kitchen. The API is the **waiter**. The waiter takes your order from the table, walks it over to the kitchen, waits for the dish to be prepared, and brings it back to you.

### What is REST?

**REST** (Representational State Transfer) is a set of rules and conventions for designing web APIs. In REST:
- Everything is treated as a **resource** (e.g., leads, contacts, deals, users).
- Resources are accessed through unique addresses called **endpoints** (e.g., `/api/leads`).
- Standard HTTP action verbs (methods) determine what action to perform on that resource.

### Common HTTP Methods in SalesMax CRM

- **GET:** Retrieve information (safe, read-only).
  - Example: `GET /api/leads` - Fetches a list of all sales leads.
- **POST:** Create a brand-new record.
  - Example: `POST /api/leads` - Submits details to create a new lead.
- **PUT:** Update an existing record completely.
  - Example: `PUT /api/leads/5` - Updates all details for lead number 5.
- **DELETE:** Remove a record.
  - Example: `DELETE /api/leads/5` - Deletes lead number 5 permanently.

### HTTP Status Codes

When the backend answers a request, it returns a 3-digit number called a status code to tell the frontend what happened:

- **200 OK:** Everything went smoothly, here is your requested data.
- **201 Created:** Success! A new record was successfully created in the database.
- **400 Bad Request:** The frontend sent invalid or incomplete data (e.g., missing required fields).
- **401 Unauthorized:** The user is not logged in or provided an invalid login token.
- **404 Not Found:** The requested resource does not exist (e.g., lead ID 9999 was not found).
- **500 Internal Server Error:** An unexpected bug crashed the server code while processing the request.

---

## 5. What is JSON?

**JSON** stands for *JavaScript Object Notation*. It is the standard text-based data format used by frontends and backends to send messages back and forth.

> **The Universal Language Analogy:**
> Imagine a customer who only speaks French and a chef who only speaks Japanese. To communicate, they agree to write all orders on paper in simple English. JSON is that shared common language for computers.

JSON organizes information into key-value pairs enclosed in curly braces `{}`.

### Example: A Lead in JSON Format

```json
{
  "id": 42,
  "first_name": "Aarav",
  "last_name": "Sharma",
  "email": "aarav.sharma@example.com",
  "phone": "+91-9876543210",
  "company": "Zenith Tech",
  "status": "Contacted",
  "deal_value": 50000.00
}
```

### Request Body vs. Response Body

- **Request Body:** The data sent *from* the frontend *to* the backend inside a POST or PUT request.
  - *Example:* When clicking "Save Lead", the frontend sends the name, email, and company in the request body.
- **Response Body:** The data returned *from* the backend *to* the frontend.
  - *Example:* The backend returns the newly created lead object including its newly assigned database `id` and `created_at` timestamp.

---

## 6. What is a Database?

A **database** is a specialized software system engineered to store, organize, search, and protect data reliably.

> **The Smart Filing Cabinet Analogy:**
> Think of a database as an automated, fireproof filing cabinet. Instead of loose papers scattered across a desk, files are placed into categorized folders with clear labels, dividers, and an instant search index.

### Tables, Rows, and Columns

Inside a relational database, data is stored in **tables** (like a spreadsheet):
- **Columns** define what kind of data each entry holds (e.g., `id`, `name`, `email`).
- **Rows** are the individual entries (e.g., one specific customer lead).

#### Example: `leads` Table

| id | first_name | last_name | email                    | company      | status     |
|----|------------|-----------|--------------------------|--------------|------------|
| 1  | Priya      | Patel     | priya@patelcorp.com      | Patel Corp   | New        |
| 2  | Rohan      | Verma     | rohan@cloudworks.in      | CloudWorks   | Qualified  |
| 3  | Ananya     | Iyer      | ananya@apexlogistics.com | Apex Log     | Contacted  |

### PostgreSQL

SalesMax CRM uses **PostgreSQL**, an enterprise-grade, open-source relational database management system (RDBMS). It is renowned for data integrity, performance, reliability, and support for complex queries.

### Why a Relational Database?

In a CRM, business data is connected:
- One **Company** has many **Contacts**.
- One **Contact** can be associated with multiple **Deals**.
- Every **Activity** (calls, emails, meetings) is tied to a specific **Lead**.

A relational database enforces these relationships, ensuring that if a deal is created, it is always linked to a valid customer.

### Primary Keys and Foreign Keys

- **Primary Key (PK):** A unique identification number assigned to every row in a table. No two rows in the same table can have the same primary key. (Like an employee ID card number).
- **Foreign Key (FK):** A column in one table that points directly to the Primary Key of another table, creating a verified connection between them. (Like writing a company ID on a person's badge to show where they work).

---

## 7. What is an ORM?

**ORM** stands for *Object-Relational Mapping*. It is a programming library that allows developers to interact with a database using object-oriented code (Python classes) instead of writing raw SQL queries by hand.

> **The Translator Analogy:**
> Imagine you want to speak to someone who only understands SQL, but you only speak Python. The ORM acts as an instant real-time translator standing between you two.

### SQLAlchemy

SalesMax CRM uses **SQLAlchemy**, the industry standard ORM for Python.

Instead of writing raw SQL like this:

```sql
SELECT * FROM leads WHERE status = 'New' AND deal_value > 10000;
```

You can write clean Python code like this:

```python
new_high_value_leads = (
    session.query(Lead)
    .filter(Lead.status == "New", Lead.deal_value > 10000)
    .all()
)
```

### How a Python Class Represents a Database Table

```python
from sqlalchemy import Column, Integer, String, Float
from database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(120), unique=True, index=True)
    deal_value = Column(Float, default=0.0)
```

### Why ORMs are Useful

1. **Less SQL to Write:** Developers work faster using familiar Python objects and methods.
2. **Database-Agnostic:** If you ever switch from PostgreSQL to MySQL or SQLite, your Python code remains almost identical.
3. **Type Safety & Autocomplete:** Your code editor understands your data models, helping prevent typos in column names.
4. **Protection Against SQL Injection:** ORMs automatically sanitize user inputs, protecting your database against malicious SQL attacks.

---

## 8. Authentication and Authorization

Security is paramount in a CRM because it holds sensitive business customer lists, deal values, and financial contacts.

- **Authentication (AuthN):** "Who are you?" (Proving your identity with an email and password).
- **Authorization (AuthZ):** "What are you allowed to do?" (Checking permissions based on your assigned role).

### JWT (JSON Web Token)

SalesMax CRM uses **JWT** for authentication. A JWT is a digitally signed, tamper-proof string containing encrypted user information.

> **The Concert Wristband Analogy:**
> When you attend a music festival, you show your ticket at the entrance once. The security staff hands you a special stamped wristband. From that point forward, you do not pull out your paper ticket and ID card every time you buy water or enter a stage. You simply show your wristband. The JWT is your digital wristband.

### The Authentication Flow

1. **Login Request:** The user types their email and password into the Next.js or React Native login screen and clicks "Log In".
2. **Verification:** The frontend sends a `POST /api/auth/login` request. FastAPI searches PostgreSQL for the user and verifies the hashed password.
3. **Token Generation:** If valid, FastAPI creates a signed JWT containing the user ID and role, then sends it back to the client.
4. **Token Storage:** The client saves the token (in secure browser cookies or mobile encrypted storage).
5. **Authenticated Requests:** On every subsequent request (e.g., viewing leads), the client attaches the token in the HTTP Authorization header:
   `Authorization: Bearer TOKEN_STRING`
6. **Validation:** FastAPI verifies the token's digital signature. If valid, the request proceeds; if expired or altered, it returns `401 Unauthorized`.

### Authorization and Roles

Not all users have equal access. SalesMax CRM supports three primary roles:

- **Admin:** Complete access. Can manage users, export all data, configure webhooks, and change system settings.
- **Manager:** Can view and manage team pipelines, assign leads to sales executives, and view team reports.
- **Sales Executive:** Can view and update their own assigned leads, create notes, and log sales calls.

### Token Expiration

Tokens are configured to expire after a set time (e.g., 8 hours). This ensures that if a device is left unattended or a token is intercepted, it will automatically become useless after the expiration window passes.

---

## 9. What are Webhooks?

A **webhook** is an automated message sent from one application to another when a specific event happens.

> **The Doorbell Analogy:**
> Imagine you are expecting a package delivery.
> - **Without Webhooks (Polling):** You stand up, open your front door, look outside, and close the door every 3 minutes to see if the courier has arrived. This wastes energy and time.
> - **With Webhooks:** You relax on your sofa. When the courier arrives, they press your **doorbell**. You only open the door when the bell rings.

### Real-World CRM Example

When a sales executive marks a deal as "Closed-Won" in SalesMax CRM:
1. The backend triggers an outgoing webhook.
2. A message payload is sent automatically to the company's Slack `#sales-wins` channel:
   *"Hooray! Deal worth $50,000 closed with Zenith Tech by Priya!"*

### Incoming vs. Outgoing Webhooks

- **Outgoing Webhooks:** SalesMax CRM detects an internal event (e.g., new lead added) and notifies an external service (e.g., Slack, email provider, analytics platform).
- **Incoming Webhooks:** An external service notifies SalesMax CRM. For example, when a prospective customer fills out a contact form on your marketing website, the website sends an incoming webhook to `POST /api/webhooks/website-lead` to automatically add them into SalesMax CRM.

---

## 10. Project Structure

SalesMax CRM is organized as a **monorepo** (a single Git repository containing all related sub-projects). Here is the layout of the project:

```text
salesmax-crm/
|-- docs/                  # Project documentation, guides, and architectural diagrams
|   `-- architecture.md    # This architecture guide
|-- web/                   # Web frontend application (Next.js + TypeScript + Tailwind)
|   |-- src/
|   |   |-- app/           # Next.js App Router pages and layouts
|   |   `-- components/    # Reusable UI components (tables, buttons, navbars)
|   |-- package.json       # Web dependencies and build scripts
|   `-- tailwind.config.js # Styling configurations
|-- backend/               # Backend API service (Python + FastAPI + SQLAlchemy)
|   |-- app/
|   |   |-- api/           # API routes and endpoint controllers
|   |   |-- models/        # SQLAlchemy database models
|   |   |-- schemas/       # Pydantic schemas for data validation
|   |   `-- main.py        # Application entry point
|   |-- requirements.txt   # Python package dependencies
|   `-- alembic/           # Database migration files
|-- mobile/                # Mobile application (React Native + Expo)
|   |-- screens/           # Mobile screens (LeadList, DealDetail)
|   |-- components/        # Mobile-specific UI elements
|   `-- app.json           # Expo project configuration
|-- .gitignore             # Tells Git which files to ignore (node_modules, .env, __pycache__)
`-- README.md              # Project overview, setup steps, and getting started guide
```

---

## 11. How the Pieces Connect (End-to-End Walkthrough)

Let us follow what happens behind the scenes during a common user action.

### Scenario: A Salesperson Adds a New Lead on the Web

```text
[User clicks "Save Lead"]
          |
          v
1. Next.js creates HTTP POST request with JSON payload
          |
          v
2. Request travels over the Internet to FastAPI: POST /api/leads
          |
          v
3. FastAPI validates data fields (email format, required names)
          |
          v
4. SQLAlchemy transforms Python Lead object into SQL INSERT query
          |
          v
5. PostgreSQL executes query, writes to disk, returns new record ID
          |
          v
6. FastAPI converts saved Lead into JSON response (Status 201 Created)
          |
          v
7. Next.js receives JSON, adds the new lead to the list, shows a success toast
```

### The Mobile App Flow

What happens when a mobile user on an iPhone or Android phone does the exact same action?

**The exact same sequence occurs!**
1. The React Native app collects the input from the mobile form.
2. It sends the identical `POST /api/leads` request with the identical JSON structure.
3. The FastAPI backend and PostgreSQL database handle it without needing to know whether the request came from a phone, a desktop browser, or a tablet.
4. The mobile app receives the `201 Created` response and updates the screen.

---

## 12. Key Architecture Decisions

Here is a summary of the fundamental design choices made for SalesMax CRM and the reasoning behind each:

1. **Shared Backend (FastAPI for both Web and Mobile):**
   - *Why:* Drastically reduces development and maintenance overhead. Bug fixes and business logic updates are applied once for all platforms.
2. **REST API Architecture:**
   - *Why:* Universal, battle-tested, and intuitive. Developers can easily test endpoints using standard tools like Postman, curl, or FastAPI's interactive Swagger UI.
3. **PostgreSQL Relational Database:**
   - *Why:* Sales data has strict relationships (leads belong to companies, deals have activities). Relational databases prevent orphan records and maintain rock-solid data integrity.
4. **Stateless JWT Authentication:**
   - *Why:* The backend does not need to store active session files in server memory. This makes it effortless to scale the backend across multiple server instances and works seamlessly across both web browsers and mobile apps.
5. **Monorepo Code Organization:**
   - *Why:* Having `web`, `backend`, `mobile`, and `docs` in a single repository allows developers to view and coordinate cross-stack changes in a single Git pull request, making onboarding much easier for freshers.

---

## Conclusion & Next Steps

You now understand the big picture of how SalesMax CRM is structured! As you begin writing code:

- If you work on the **web**, you will focus on Next.js, components, and Tailwind styling inside `web/`.
- If you work on the **mobile app**, you will work with React Native and Expo inside `mobile/`.
- If you work on the **backend**, you will define endpoints, models, and business logic inside `backend/`.

Every piece has a clear purpose, and together they create a fast, reliable, and scalable CRM platform. Happy coding!
