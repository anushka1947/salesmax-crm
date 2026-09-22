# SalesMax CRM - Product Requirements Document

## Project Overview

SalesMax CRM is a centralized, modern Customer Relationship Management system built to streamline sales pipelines, accelerate deal cycles, and empower sales organizations to manage customer relationships with confidence. The platform connects customer touchpoints across leads, contacts, activities, and deals, giving administrators, sales managers, and sales executives role-optimized tools to drive revenue growth.

This document outlines the product requirements using the **MoSCoW Prioritization Framework**:
- **Must Have (MVP)**: Fundamental capabilities essential for a viable, operational sales CRM.
- **Should Have**: High-impact enhancements scheduled directly after the core release to enrich communication, analytics, and integrations.
- **Advanced**: Innovative capabilities such as artificial intelligence, workflow orchestration, and offline data synchronization to deliver long-term competitive advantage.

---

## 1. MUST HAVE (MVP)

These core features represent the non-negotiable foundation required to run daily sales operations, manage customer records, track deal progression, and enforce data security.

### 1.1 Authentication & User Management
- [ ] **Email and Password Login / Logout**: Authenticates users securely via registered email addresses and passwords, supporting persistent sessions and safe logout.
- [ ] **JWT-Based Authentication**: Implements JSON Web Tokens for stateless and secure client-server communication across all API endpoints.
- [ ] **Admin-Initiated User Registration**: Enforces private onboarding where platform administrators explicitly register and invite new team members.
- [ ] **Password Reset Workflow**: Provides a self-service password recovery flow that delivers secure, time-sensitive reset links to user email accounts.
- [ ] **User Profile Management**: Enables authenticated team members to inspect and update personal details, such as full name, contact phone number, and profile picture.

### 1.2 Role-Based Access Control (RBAC)
- [ ] **Three-Tier Role Hierarchy**: Establishes distinct operational roles for Admin, Manager, and Sales Executive to govern data visibility and administrative authority.
- [ ] **Admin Role Access**: Grants unrestricted access to all organizational records, user provisioning, global system settings, and audit configurations.
- [ ] **Manager Role Access**: Provides complete visibility over team-level pipeline metrics, performance reports, and lead reassignment across reporting executives.
- [ ] **Sales Executive Role Access**: Restricts data access strictly to leads, contacts, tasks, notes, and deals directly assigned to or owned by the individual representative.

### 1.3 Dashboard
- [ ] **Key Metric Summary Cards**: Displays real-time indicators for total leads, active deals, tasks due today, and overall lead-to-deal conversion rates.
- [ ] **Recent Activity Feed**: Provides an up-to-the-minute chronological stream of system-wide actions, such as status changes, newly logged calls, and deal progressions.
- [ ] **Quick Action Shortcuts**: Offers convenient one-click modal triggers allowing users to rapidly create a lead or schedule a task from any screen.
- [ ] **Role-Specific Dashboard Views**: Delivers customized layouts where Admins see company-wide metrics, Managers see team performance, and Sales Executives monitor their personal quotas and urgent tasks.

### 1.4 Lead Management
- [ ] **Lead CRUD Operations**: Full operational support for creating, reading, updating, and archiving lead records through an intuitive interface.
- [ ] **Comprehensive Lead Fields**: Captures essential lead metadata including full name, email, phone number, company name, acquisition source, status, assigned owner, and background notes.
- [ ] **Standardized Lead Status Lifecycle**: Tracks prospects across six standardized stages: New, Contacted, Qualified, Unqualified, Converted, and Lost.
- [ ] **Universal Lead Search**: Delivers rapid text matching across lead name, email address, contact phone number, and company name.
- [ ] **Multi-Dimensional Filtering**: Filters lead lists dynamically by status, lead source, assigned sales representative, and creation date ranges.
- [ ] **Lead Assignment & Reassignment**: Facilitates immediate assignment of new leads to sales executives and allows managers to balance workloads through reassignment.
- [ ] **Lead Detail Page & Timeline**: Serves as the central command view for a prospect, consolidating contact info, deal linkages, and a complete interaction timeline.

### 1.5 Contacts
- [ ] **Contact CRUD Operations**: Supports standard create, view, edit, and delete operations for individual client and prospect contacts.
- [ ] **Standard Contact Fields**: Records core contact details including name, email, phone number, associated company, job designation, and physical address.
- [ ] **Entity Relationship Linking**: Connects individual contacts to parent lead histories and associated active deals for consistent relationship context.
- [ ] **Contact Search and Filter**: Offers fast keyword search and filtering criteria to quickly locate key stakeholders within customer accounts.

### 1.6 Activity Timeline
- [ ] **Chronological Activity Log**: Automatically maintains an append-only, timestamped history of all engagements associated with each lead or contact.
- [ ] **Multi-Type Event Capture**: Records specific event categories including note additions, status updates, logged calls, created tasks, and newly opened deals.
- [ ] **Embedded Detail Page Display**: Surfaces the unified activity stream directly within the lead and contact detail views for immediate context.
- [ ] **Activity Filter Controls**: Allows representatives to filter timeline entries by event type to review specific interactions like call logs or status transitions.

### 1.7 Notes
- [ ] **Contextual Note Taking**: Allows sales representatives to write and attach unstructured text notes to leads, contacts, and deals.
- [ ] **Author and Timestamp Tracking**: Automatically attaches the author's identity and creation or update timestamps to every note entry.
- [ ] **Author-Based Edit and Delete**: Restricts modification and deletion privileges to the original note author to maintain record authenticity.

### 1.8 Tasks
- [ ] **Task CRUD Operations**: Enables team members to create, inspect, modify, and delete daily operational tasks.
- [ ] **Structured Task Attributes**: Captures task title, description, due date, priority (Low, Medium, High), status (Pending, In Progress, Completed), assigned user, and related lead or contact.
- [ ] **My Tasks View**: Presents a focused personal view of pending and upcoming tasks assigned to the authenticated user, prioritized by due date.
- [ ] **Task Filtering**: Filters task registries by completion status, priority level, due date window, and related entity.
- [ ] **Quick Completion Toggle**: Allows sales representatives to mark tasks as completed with a single checkbox click to maintain momentum.

### 1.9 Follow-ups
- [ ] **Follow-up Scheduling**: Enables sales representatives to schedule structured follow-ups with precise dates, times, and communication channels (Call, Email, WhatsApp, Meeting).
- [ ] **Follow-up Reminders**: Triggers timely alerts prior to scheduled follow-up appointments to prevent missed prospect touchpoints.
- [ ] **Overdue Follow-up Tracking**: Flags overdue follow-up appointments with prominent visual warning tags to ensure immediate remediation.
- [ ] **Entity Linking**: Binds every scheduled follow-up directly to the relevant lead or contact record for instant conversational context.

### 1.10 Deals
- [ ] **Deal CRUD Operations**: Full management of sales revenue opportunities from creation through successful closing or disqualification.
- [ ] **Comprehensive Deal Fields**: Tracks critical deal metrics including title, monetary value, stage, win probability percentage, expected close date, assigned owner, and associated lead or contact.
- [ ] **Configurable Deal Stages**: Allows system administrators to customize the sequence of deal stages to align with organizational sales methodologies.
- [ ] **Lead and Contact Association**: Maintains bidirectional links connecting deals to source leads and primary contacts for end-to-end deal traceability.

### 1.11 Kanban Sales Pipeline
- [ ] **Interactive Kanban Board**: Visualizes the sales pipeline as a responsive board with stage columns and interactive deal cards.
- [ ] **Pipeline Stage Columns**: Represents the progressive phases of the sales cycle through distinct vertical stage columns.
- [ ] **Informative Deal Cards**: Displays key deal attributes on each card, including deal title, financial value, primary contact name, and target close date.
- [ ] **Drag-and-Drop Stage Transitions**: Updates a deal's current stage and associated stage metrics automatically when its card is dragged to a new column.
- [ ] **Default Pipeline Stages**: Pre-populates the board with standard stages: New, Qualified, Proposal Sent, Negotiation, Won, and Lost.

### 1.12 Basic Notifications
- [ ] **In-App Notification Center**: Centralized drop-down notification tray displaying real-time operational alerts within the main application header.
- [ ] **Core Notification Triggers**: Emits automated notifications for key events, including lead assignments, task deadlines, follow-up reminders, and deal stage changes.
- [ ] **Read and Unread Status Management**: Lets users mark individual alerts or entire lists as read to keep notifications organized.
- [ ] **Unread Notification Badge Count**: Displays a visible numeric counter badge over the notification bell icon that refreshes with incoming alerts.

---

## 2. SHOULD HAVE

These capabilities add substantial operational efficiency, automate customer communication, and deliver sales intelligence, but are not strictly required for initial platform launch.

### 2.1 Calls
- [ ] **Click-to-Call Functionality**: Initiates telephone calls directly from lead or contact phone numbers using integrated telephony links.
- [ ] **Manual Call Logging**: Provides a dedicated modal to log call duration, selected conversation outcome, and detailed call notes.
- [ ] **Historical Call Records**: Displays a complete, chronological log of past telephone interactions within the lead or contact timeline.
- [ ] **Standardized Call Outcomes**: Categorizes call results using fixed statuses: Connected, Not Answered, Busy, Wrong Number, and Callback Requested.

### 2.2 WhatsApp Integration
- [ ] **WhatsApp Business API Integration**: Connects the CRM directly to the official WhatsApp Business API for compliant outbound and inbound messaging.
- [ ] **Template Message Dispatch**: Allows sales representatives to send pre-approved WhatsApp message templates directly from customer profile cards.
- [ ] **In-CRM Chat View**: Embeds a modern two-way WhatsApp chat conversation interface inside the CRM without requiring third-party messaging tabs.
- [ ] **Per-Entity Message History**: Stores complete message logs and media exchanges against the corresponding lead and contact records.
- [ ] **Automated Reply Setup**: Enables teams to configure automated greeting messages and out-of-office responses for incoming prospect inquiries.

### 2.3 Reports & Analytics
- [ ] **Lead Source Performance Report**: Compares inbound lead volumes and conversion rates across different marketing and acquisition channels.
- [ ] **Conversion Funnel Report**: Visualizes stage-by-stage drop-off across the sales funnel to isolate pipeline conversion bottlenecks.
- [ ] **Sales Team Performance Report**: Evaluates individual representative performance based on logged calls, completed tasks, deals closed, and revenue generated.
- [ ] **Pipeline Valuation Report**: Calculates aggregate pipeline value, weighted revenue forecasts, and stage distributions across specified timeframes.
- [ ] **Date Range Filtering**: Applies dynamic date range controls (e.g., this week, this quarter, custom period) across all reporting views.
- [ ] **CSV Report Exporting**: Enables managers to export report tables and raw analytics datasets into CSV format for external analysis.

### 2.4 Quotes / Proposals
- [ ] **Line-Item Quote Builder**: Generates structured commercial quotes with customizable item descriptions, quantities, unit prices, taxes, and discounts.
- [ ] **Standardized Calculation Fields**: Automatically computes sub-totals, applicable tax calculations, applied discounts, and net payable amounts.
- [ ] **PDF Document Generation**: Renders finalized quotes into polished, professional PDF documents ready to email directly to prospects.
- [ ] **Deal Linkage**: Links generated quotes directly to active deals to track pricing discussions and proposal revisions against deal values.
- [ ] **Quote Lifecycle Tracking**: Tracks quote progress through distinct operational statuses: Draft, Sent, Accepted, and Rejected.

### 2.5 Payments
- [ ] **Deal Payment Logging**: Enables sales and finance staff to log incoming payments and credit receipts directly against deals.
- [ ] **Detailed Payment Fields**: Captures essential transaction data including payment amount, transaction date, payment method, and external reference numbers.
- [ ] **Itemized Payment History**: Maintains a clear chronological ledger of all received payments and balance adjustments for every deal.
- [ ] **Partial Payment & Installment Tracking**: Automatically computes remaining balances and tracks installment payments against the total contract value.

### 2.6 External Lead Capture
- [ ] **Embeddable Web Form Generator**: Generates embeddable HTML and JavaScript code snippets for seamless deployment of lead capture forms on external sites.
- [ ] **Landing Page Form Ingestion API**: Provides a secure public REST API endpoint to push external landing page submissions directly into the CRM.
- [ ] **Facebook Lead Ads Integration**: Synchronizes inbound leads captured via Meta Facebook Lead Ads into the CRM in real time.
- [ ] **Google Ads Lead Form Integration**: Automatically imports incoming prospect data submitted through Google Ads lead extension forms.

### 2.7 Webhooks
- [ ] **Outgoing Event-Driven Webhooks**: Dispatches HTTPS POST payloads to external endpoints when key lifecycle events occur, such as lead creation or deal closure.
- [ ] **Webhook Management UI**: Provides an administrative portal to register endpoint URLs, select subscribed events, and configure secret keys.
- [ ] **Webhook Delivery Logs & Retries**: Records outgoing delivery timestamps, HTTP response codes, and payload bodies with built-in retry mechanisms for failed requests.

---

## 3. ADVANCED

These future-facing features leverage artificial intelligence, complex workflow automation, and distributed synchronization to deliver competitive differentiation and enterprise scale.

### 3.1 AI Lead Summary
- [ ] **Automated Interaction Summaries**: Employs generative AI models to condense long histories of notes, calls, and emails into concise executive summaries.
- [ ] **Key Insights Extraction**: Automatically identifies customer pain points, budget constraints, timeline urgency, and decision-maker sentiment from unstructured text.

### 3.2 AI Next-Action Suggestions
- [ ] **Context-Aware Action Recommendations**: Analyzes historical sales velocity and interaction patterns to recommend the optimal next step for each prospect.
- [ ] **Stage-Specific Guidance**: Suggests ideal follow-up intervals, collateral recommendations, and meeting proposals based on current deal stage dynamics.

### 3.3 Call Transcription
- [ ] **Automated Speech-to-Text Transcription**: Transcribes recorded audio phone calls into structured, speaker-labeled text transcripts.
- [ ] **Searchable Transcript Archive**: Indexes call transcripts so sales representatives can search across all recorded customer conversations by keyword.
- [ ] **AI-Generated Call Summaries**: Extracts key conversation highlights, agreed action items, and prospect commitments directly from call transcripts.

### 3.4 Workflow Automation
- [ ] **Visual Workflow Builder**: Provides a canvas-based drag-and-drop workflow designer to construct multi-step business logic without code.
- [ ] **Trigger-Action Automation**: Automatically executes predefined actions, such as task generation or notification dispatch, when trigger conditions are met.
- [ ] **Automated Lead Assignment Rules**: Distributes incoming leads to sales executives based on territory, round-robin rules, or lead qualification score.
- [ ] **Drip Campaign Sequences**: Automates multi-stage follow-up sequences across email and messaging channels based on elapsed time or recipient behavior.

### 3.5 Advanced Analytics
- [ ] **Predictive Revenue Forecasting**: Utilizes historical conversion rates and pipeline velocity to predict future quarter revenues with confidence intervals.
- [ ] **Machine Learning Lead Scoring**: Calculates dynamic lead scores based on profile completeness, behavioral interactions, and historical win probabilities.
- [ ] **Custom Drag-and-Drop Dashboards**: Allows executives and managers to build customized dashboard views using modular visualization widgets.
- [ ] **Real-Time Analytics Streaming**: Streams live sales activity updates and pipeline metric adjustments using real-time event sockets.

### 3.6 Offline Mobile Sync
- [ ] **Offline Operation Support**: Enables mobile users to inspect, create, and update leads, contacts, and tasks even without an internet connection.
- [ ] **Local Encrypted Data Storage**: Stores cached CRM records securely in an encrypted local database on the mobile device.
- [ ] **Background Synchronization**: Detects restored connectivity and automatically syncs local offline changes with the central server.
- [ ] **Conflict Resolution Engine**: Resolves data collisions using deterministic timestamp rules and audit logs when records are modified simultaneously across devices.
