# SalesMax CRM REST API Specification

This document defines the REST API architecture and endpoint specifications for the SalesMax CRM application. All endpoints are versioned with the prefix `/api/v1`.

## API Design Principles

The SalesMax CRM API adheres to standard RESTful patterns for predictability, consistency, and ease of integration:

- **RESTful Conventions**: Standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) map cleanly to CRUD operations on pluralized nouns representing domain resources (e.g., `/leads`, `/deals`).
- **JSON Payloads**: All request bodies and responses use `application/json` with UTF-8 encoding. Endpoints returning binary content (e.g., PDF downloads) use specific MIME types (`application/pdf`).
- **JWT Bearer Authentication**: Authenticated requests must pass a valid JWT in the HTTP `Authorization` header using the `Bearer <token>` format. Public endpoints (such as login and password reset) do not require authentication.
- **Consistent Error Response Format**: Failures return standard JSON error structures containing machine-readable error codes and descriptive field-level error messages.
- **Pagination for List Endpoints**: List endpoints default to offset pagination using `page` and `per_page` query parameters, returning a standardized pagination envelope.
- **Filtering via Query Parameters**: Filtering, sorting, and keyword searches are performed through URL query parameters.
- **Standard HTTP Status Codes**: Explicit HTTP status codes signal operation outcomes (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `422 Unprocessable Entity`).

## Error Response Format

All error responses return an informative JSON payload:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [{ "field": "email", "message": "Must be a valid email address" }]
  }
}
```

### Error Codes and Status Mappings

| Error Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 422 Unprocessable Entity | Provided payload failed business logic or schema validation. |
| `BAD_REQUEST` | 400 Bad Request | Malformed JSON or missing required headers. |
| `UNAUTHORIZED` | 401 Unauthorized | Missing, invalid, or expired authentication token. |
| `FORBIDDEN` | 403 Forbidden | User lacks the required role or permission for this resource. |
| `NOT_FOUND` | 404 Not Found | Requested entity identifier does not exist. |
| `CONFLICT` | 409 Conflict | Resource already exists or conflicting state detected. |
| `INTERNAL_SERVER_ERROR` | 500 Internal Server Error | Unhandled server error. |

## Pagination Format

List endpoints return data inside a uniform pagination envelope:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### Standard List Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Current page number (1-indexed). |
| `per_page` | integer | `20` | Number of items per page (max 100). |
| `sort_by` | string | `created_at` | Field to sort results by. |
| `sort_order` | string | `desc` | Sort direction (`asc` or `desc`). |
| `search` | string | null | Text search across relevant string fields. |

## Authentication

Endpoints for user authentication, token refresh, and session management.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| POST | `/api/v1/auth/login` | Login with email/password, returns JWT tokens | No | Public |
| POST | `/api/v1/auth/logout` | Invalidate current token | Yes | All Roles |
| POST | `/api/v1/auth/refresh` | Refresh access token | No | Public |
| POST | `/api/v1/auth/forgot-password` | Send password reset email | No | Public |
| POST | `/api/v1/auth/reset-password` | Reset password with token | No | Public |
| GET | `/api/v1/auth/me` | Get current user profile | Yes | All Roles |
| PUT | `/api/v1/auth/me` | Update current user profile | Yes | All Roles |

### Example: Login (`POST /api/v1/auth/login`)

**Request:**
```json
{
  "email": "alex.chen@salesmax.io",
  "password": "SecurePassword123!"
}
```

**Response (`200 OK`):**
```json
{
  "user": {
    "id": "usr_9124a91b",
    "email": "alex.chen@salesmax.io",
    "first_name": "Alex",
    "last_name": "Chen",
    "role": "admin"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "def502008f1b67c4e09f87...",
    "expires_in": 3600
  }
}
```

## Users (Admin only)

Workspace user provisioning and access management.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/users` | List all users in workspace | Yes | Admin |
| POST | `/api/v1/users` | Create new user (admin invites) | Yes | Admin |
| GET | `/api/v1/users/{id}` | Get user details | Yes | Admin |
| PUT | `/api/v1/users/{id}` | Update user | Yes | Admin |
| DELETE | `/api/v1/users/{id}` | Deactivate user | Yes | Admin |

**Query Parameters (`GET /api/v1/users`):** `role` (`admin`, `manager`, `rep`), `status` (`active`, `invited`, `deactivated`), `search`, `page`, `per_page`.

## Leads

Manage prospect leads, assignment, activity history, and qualification conversion.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/leads` | List leads (filterable: status, source, assigned_to, search, date_range) | Yes | Admin, Manager, Rep |
| POST | `/api/v1/leads` | Create new lead | Yes | Admin, Manager, Rep |
| GET | `/api/v1/leads/{id}` | Get lead details (includes recent activities) | Yes | Admin, Manager, Rep |
| PUT | `/api/v1/leads/{id}` | Update lead | Yes | Admin, Manager, Rep |
| DELETE | `/api/v1/leads/{id}` | Delete lead | Yes | Admin, Manager |
| POST | `/api/v1/leads/{id}/assign` | Assign lead to a user | Yes | Admin, Manager |
| POST | `/api/v1/leads/{id}/convert` | Convert lead to contact | Yes | Admin, Manager, Rep |
| GET | `/api/v1/leads/{id}/activities` | Get lead activity timeline | Yes | Admin, Manager, Rep |
| GET | `/api/v1/leads/{id}/tasks` | Get tasks for this lead | Yes | Admin, Manager, Rep |
| GET | `/api/v1/leads/{id}/notes` | Get notes for this lead | Yes | Admin, Manager, Rep |
| GET | `/api/v1/leads/{id}/calls` | Get calls for this lead | Yes | Admin, Manager, Rep |
| GET | `/api/v1/leads/{id}/messages` | Get messages for this lead | Yes | Admin, Manager, Rep |

**Query Parameters (`GET /api/v1/leads`):** `status`, `source`, `assigned_to`, `search`, `created_from`, `created_to`, `page`, `per_page`.

### Example: Create Lead (`POST /api/v1/leads`)

**Request:**
```json
{
  "first_name": "Elena",
  "last_name": "Rostova",
  "email": "elena.rostova@acmecorp.com",
  "phone": "+1-415-555-0199",
  "company": "Acme Corporation",
  "source": "website",
  "status": "new",
  "assigned_to": "usr_9124a91b"
}
```

**Response (`201 Created`):**
```json
{
  "id": "ld_7289f81a3d",
  "first_name": "Elena",
  "last_name": "Rostova",
  "email": "elena.rostova@acmecorp.com",
  "phone": "+1-415-555-0199",
  "company": "Acme Corporation",
  "source": "website",
  "status": "new",
  "assigned_to": "usr_9124a91b",
  "created_at": "2026-09-18T13:20:00Z"
}
```

## Contacts

Manage qualified customer contacts and linked account relationships.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/contacts` | List contacts | Yes | Admin, Manager, Rep |
| POST | `/api/v1/contacts` | Create contact | Yes | Admin, Manager, Rep |
| GET | `/api/v1/contacts/{id}` | Get contact details | Yes | Admin, Manager, Rep |
| PUT | `/api/v1/contacts/{id}` | Update contact | Yes | Admin, Manager, Rep |
| DELETE | `/api/v1/contacts/{id}` | Delete contact | Yes | Admin, Manager |
| GET | `/api/v1/contacts/{id}/activities` | Get contact activity timeline | Yes | Admin, Manager, Rep |
| GET | `/api/v1/contacts/{id}/deals` | Get deals for this contact | Yes | Admin, Manager, Rep |

**Query Parameters (`GET /api/v1/contacts`):** `company_id`, `assigned_to`, `search`, `page`, `per_page`.

## Deals

Track sales opportunities, pipeline movements, associated quotes, and transactions.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/deals` | List deals (filterable: stage, assigned_to, date_range) | Yes | Admin, Manager, Rep |
| POST | `/api/v1/deals` | Create deal | Yes | Admin, Manager, Rep |
| GET | `/api/v1/deals/{id}` | Get deal details | Yes | Admin, Manager, Rep |
| PUT | `/api/v1/deals/{id}` | Update deal | Yes | Admin, Manager, Rep |
| DELETE | `/api/v1/deals/{id}` | Delete deal | Yes | Admin, Manager |
| PUT | `/api/v1/deals/{id}/stage` | Move deal to different stage (Kanban drag-drop) | Yes | Admin, Manager, Rep |
| GET | `/api/v1/deals/{id}/activities` | Get deal activity timeline | Yes | Admin, Manager, Rep |
| GET | `/api/v1/deals/{id}/quotes` | Get quotes for this deal | Yes | Admin, Manager, Rep |
| GET | `/api/v1/deals/{id}/payments` | Get payments for this deal | Yes | Admin, Manager, Rep |

**Query Parameters (`GET /api/v1/deals`):** `stage`, `assigned_to`, `status` (`open`, `won`, `lost`), `close_date_from`, `close_date_to`, `page`, `per_page`.

## Pipeline

Configure Kanban stages and retrieve aggregated visual pipeline board datasets.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/pipeline/stages` | Get all pipeline stages (ordered) | Yes | Admin, Manager, Rep |
| POST | `/api/v1/pipeline/stages` | Create new stage (admin) | Yes | Admin |
| PUT | `/api/v1/pipeline/stages/{id}` | Update stage (name, order, color) | Yes | Admin |
| DELETE | `/api/v1/pipeline/stages/{id}` | Delete stage (admin) | Yes | Admin |
| GET | `/api/v1/pipeline/board` | Get Kanban board data (stages with their deals) | Yes | Admin, Manager, Rep |
| PUT | `/api/v1/pipeline/reorder` | Reorder stages | Yes | Admin |

### Example: Get Pipeline Board (`GET /api/v1/pipeline/board`)

**Response (`200 OK`):**
```json
{
  "total_value": 195000.00,
  "stages": [
    {
      "id": "stg_discovery",
      "name": "Discovery",
      "order": 1,
      "color": "#3B82F6",
      "total_value": 85000.00,
      "deals": [
        {
          "id": "dl_10938a",
          "title": "Cloud Suite Migration",
          "value": 50000.00,
          "contact_name": "Sarah Connor",
          "assigned_to": "usr_9124a91b"
        },
        {
          "id": "dl_10939b",
          "title": "Security Package",
          "value": 35000.00,
          "contact_name": "John Anderton",
          "assigned_to": "usr_9124a91b"
        }
      ]
    },
    {
      "id": "stg_proposal",
      "name": "Proposal Sent",
      "order": 2,
      "color": "#F59E0B",
      "total_value": 110000.00,
      "deals": [
        {
          "id": "dl_20841c",
          "title": "CRM Enterprise License",
          "value": 110000.00,
          "contact_name": "Elena Rostova",
          "assigned_to": "usr_4412c12d"
        }
      ]
    }
  ]
}
```

## Tasks

Manage follow-ups, calls, deadlines, and task completion states.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/tasks` | List tasks (filterable: status, priority, assigned_to, due_date) | Yes | Admin, Manager, Rep |
| POST | `/api/v1/tasks` | Create task | Yes | Admin, Manager, Rep |
| GET | `/api/v1/tasks/{id}` | Get task details | Yes | Admin, Manager, Rep |
| PUT | `/api/v1/tasks/{id}` | Update task | Yes | Admin, Manager, Rep |
| DELETE | `/api/v1/tasks/{id}` | Delete task | Yes | Admin, Manager, Rep |
| PUT | `/api/v1/tasks/{id}/complete` | Mark task as complete | Yes | Admin, Manager, Rep |
| GET | `/api/v1/tasks/my` | Get current user's tasks | Yes | Admin, Manager, Rep |
| GET | `/api/v1/tasks/overdue` | Get overdue tasks | Yes | Admin, Manager, Rep |

**Query Parameters (`GET /api/v1/tasks`):** `status`, `priority`, `assigned_to`, `due_date`, `entity_type` (`lead`, `contact`, `deal`), `entity_id`, `page`, `per_page`.

## Notes

Internal team notes attached to specific CRM entities.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/notes` | List notes (filterable by lead_id, contact_id, deal_id) | Yes | Admin, Manager, Rep |
| POST | `/api/v1/notes` | Create note | Yes | Admin, Manager, Rep |
| PUT | `/api/v1/notes/{id}` | Update note | Yes | Admin, Manager, Rep |
| DELETE | `/api/v1/notes/{id}` | Delete note | Yes | Admin, Manager, Rep |

**Query Parameters (`GET /api/v1/notes`):** `lead_id`, `contact_id`, `deal_id`, `page`, `per_page`.

## Activities

Activity feed and historical interaction timeline.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/activities` | List activities (filterable, paginated) | Yes | Admin, Manager, Rep |
| GET | `/api/v1/activities/recent` | Get recent activities for dashboard | Yes | Admin, Manager, Rep |

**Query Parameters (`GET /api/v1/activities`):** `type`, `user_id`, `date_from`, `date_to`, `page`, `per_page`.

## Calls

Call logs, outcomes, and duration tracking.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/calls` | List calls | Yes | Admin, Manager, Rep |
| POST | `/api/v1/calls` | Log a call | Yes | Admin, Manager, Rep |
| GET | `/api/v1/calls/{id}` | Get call details | Yes | Admin, Manager, Rep |
| PUT | `/api/v1/calls/{id}` | Update call | Yes | Admin, Manager, Rep |

**Query Parameters (`GET /api/v1/calls`):** `lead_id`, `contact_id`, `user_id`, `outcome`, `page`, `per_page`.

## Messages

Multi-channel outbound and inbound message logging.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/messages` | List messages | Yes | Admin, Manager, Rep |
| POST | `/api/v1/messages` | Send message | Yes | Admin, Manager, Rep |
| GET | `/api/v1/messages/{id}` | Get message details | Yes | Admin, Manager, Rep |

**Query Parameters (`GET /api/v1/messages`):** `channel` (`sms`, `email`, `whatsapp`), `direction` (`inbound`, `outbound`), `recipient_id`, `page`, `per_page`.

## Quotes

Price quote generation, revisions, delivery, and PDF export.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/quotes` | List quotes | Yes | Admin, Manager, Rep |
| POST | `/api/v1/quotes` | Create quote | Yes | Admin, Manager, Rep |
| GET | `/api/v1/quotes/{id}` | Get quote details | Yes | Admin, Manager, Rep |
| PUT | `/api/v1/quotes/{id}` | Update quote | Yes | Admin, Manager, Rep |
| DELETE | `/api/v1/quotes/{id}` | Delete quote | Yes | Admin, Manager |
| POST | `/api/v1/quotes/{id}/send` | Send quote to customer | Yes | Admin, Manager, Rep |
| GET | `/api/v1/quotes/{id}/pdf` | Generate PDF | Yes | Admin, Manager, Rep |

**Query Parameters (`GET /api/v1/quotes`):** `deal_id`, `status` (`draft`, `sent`, `accepted`, `rejected`), `page`, `per_page`.

## Payments

Payment records and transaction status tracking.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/payments` | List payments | Yes | Admin, Manager |
| POST | `/api/v1/payments` | Record payment | Yes | Admin, Manager |
| GET | `/api/v1/payments/{id}` | Get payment details | Yes | Admin, Manager |
| PUT | `/api/v1/payments/{id}` | Update payment | Yes | Admin |
| DELETE | `/api/v1/payments/{id}` | Delete payment | Yes | Admin |

**Query Parameters (`GET /api/v1/payments`):** `deal_id`, `status` (`pending`, `completed`, `failed`), `date_from`, `date_to`, `page`, `per_page`.

## Notifications

User alerts, reminders, and unread notification counts.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/notifications` | Get user notifications (paginated) | Yes | All Roles |
| PUT | `/api/v1/notifications/{id}/read` | Mark notification as read | Yes | All Roles |
| PUT | `/api/v1/notifications/read-all` | Mark all notifications as read | Yes | All Roles |
| GET | `/api/v1/notifications/unread-count` | Get unread notification count | Yes | All Roles |

**Query Parameters (`GET /api/v1/notifications`):** `unread_only` (`true`/`false`), `page`, `per_page`.

## Dashboard

Operational overview and high-level summary metrics.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/dashboard/stats` | Get summary statistics | Yes | Admin, Manager, Rep |
| GET | `/api/v1/dashboard/recent-activity` | Get recent activities | Yes | Admin, Manager, Rep |
| GET | `/api/v1/dashboard/pipeline-summary` | Get pipeline value summary | Yes | Admin, Manager, Rep |
| GET | `/api/v1/dashboard/tasks-summary` | Get tasks overview | Yes | Admin, Manager, Rep |

## Reports (Manager, Admin)

Analytical and performance reports for sales operations.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/reports/lead-sources` | Lead source breakdown | Yes | Admin, Manager |
| GET | `/api/v1/reports/conversion-funnel` | Conversion funnel data | Yes | Admin, Manager |
| GET | `/api/v1/reports/team-performance` | Team performance metrics | Yes | Admin, Manager |
| GET | `/api/v1/reports/revenue` | Revenue report | Yes | Admin, Manager |
| GET | `/api/v1/reports/activity` | Activity report | Yes | Admin, Manager |

**Query Parameters for Reports:** `date_from`, `date_to`, `user_id`, `group_by` (`day`, `week`, `month`).

## Integrations (Admin)

Third-party platform integrations and configurations.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/integrations` | List integrations | Yes | Admin |
| POST | `/api/v1/integrations` | Set up integration | Yes | Admin |
| PUT | `/api/v1/integrations/{id}` | Update integration config | Yes | Admin |
| DELETE | `/api/v1/integrations/{id}` | Remove integration | Yes | Admin |

## Webhooks (Admin)

Outbound event subscriptions and delivery logging.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/v1/webhooks` | List webhooks | Yes | Admin |
| POST | `/api/v1/webhooks` | Create webhook | Yes | Admin |
| PUT | `/api/v1/webhooks/{id}` | Update webhook | Yes | Admin |
| DELETE | `/api/v1/webhooks/{id}` | Delete webhook | Yes | Admin |
| GET | `/api/v1/webhooks/{id}/logs` | Get webhook delivery logs | Yes | Admin |

**Query Parameters (`GET /api/v1/webhooks/{id}/logs`):** `status` (`success`, `failed`), `page`, `per_page`.

## External (Public - for lead capture)

Public inbound webhooks and lead capture integrations authenticated via API keys or vendor signatures.

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| POST | `/api/v1/external/leads` | Create lead from web form (API key auth) | API Key | Public |
| POST | `/api/v1/external/webhooks/facebook` | Facebook Lead Ads webhook receiver | Signature | Meta Webhook |
| POST | `/api/v1/external/webhooks/google` | Google Ads Lead Form webhook receiver | Signature | Google Webhook |

### Example: Create Lead from Web Form (`POST /api/v1/external/leads`)

**Headers:**
```
Content-Type: application/json
X-API-Key: sm_live_k8912df082341908
```

**Request:**
```json
{
  "first_name": "Marcus",
  "last_name": "Vance",
  "email": "marcus.vance@example.org",
  "phone": "+1-555-0144",
  "company": "Vance Refrigeration",
  "source": "landing_page_promo",
  "message": "Interested in CRM migration."
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "lead_id": "ld_9941a80c42",
  "message": "Lead received successfully and queued for assignment."
}
```
