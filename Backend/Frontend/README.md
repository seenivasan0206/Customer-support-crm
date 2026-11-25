
# Customer Support CRM - Frontend

React.js frontend for the Customer Support CRM application.

## Tech Stack
- React.js
- Vite
- CSS
- Axios
- React Router DOM

## Installation

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Knowledge Base API

Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` to your backend's API base URL (default: `http://localhost:8000/api`). Restart Vite after changing it.

The frontend calls `GET /knowledge/articles/` to list articles and `POST /knowledge/articles/` with `{ title, content, slug, status: "draft" }` to save an article. Lists can be arrays or paginated `{ results, next }` responses. The slug is generated in the frontend. Saving refreshes the article list; failed requests preserve the draft for retry.

The backend must allow requests from the frontend origin. This integration uses the existing article API and does not generate AI content or change backend code.

The Categories section below articles calls `GET /knowledge/categories/` using the same API base URL. It displays each category's `id`, `name`, and optional `description` (the ID is used as the React key). Both plain arrays and paginated `{ results, next }` responses are supported, with independent loading, refresh, empty, and error states.

Category creation uses `POST /knowledge/categories/`; editing uses `PATCH /knowledge/categories/{id}/`. Both send `{ name, description }`. The name is required (maximum 100 characters). Successful saves refresh categories and articles; failed saves preserve the form. All request and category UI code lives in `src/pages/KnowledgeBase.jsx`.

## Available Screens
1. Login
2. Dashboard Overview
3. Support Requests
4. Customer Management
5. Conversations & Live Chat
6. Agents & Teams
7. Knowledge Base
8. Reports & Analytics
9. Settings & Administration




## Reports & Analysis — frontend API contract

The reporting backend is **not implemented in this repository**. The page is ready to call the following proposed endpoints; coordinate this contract with the backend developer. All reporting requests and UI logic are in `src/pages/Reports.jsx`. No demonstration metrics are shown in the live UI.

The default base is `${VITE_API_BASE_URL}/reports` (for example `http://localhost:8000/api/reports`). Override it with `VITE_REPORTS_API_URL` if the backend uses a different route. Restart Vite after changing environment variables. The backend must allow the frontend origin through CORS. Current requests do not attach authentication tokens.

| Method | Endpoint under reporting base | Purpose |
| --- | --- | --- |
| GET | `/options/` | Return filter choices |
| GET | `/summary/` | Return all KPIs and chart series for the applied filters |
| POST | `/saved/` | Save a named report configuration |
| POST | `/schedules/` | Schedule report delivery on the backend |

Summary query parameters: `range` (`today`, `7d`, `30d`, `custom`), `start_date` and `end_date` (YYYY-MM-DD, custom only), `agent`, `team`, `priority`, `category`, `channel`, and the browser's IANA `timezone`. Empty filters mean all values. The backend should interpret dates inclusively in that timezone and calculate comparisons against the preceding equivalent period. Apply all filters consistently to every KPI and series.

Options response (each list may be empty; every key must exist):

```json
{
  "agents": [{ "value": "12", "label": "Agent name" }],
  "teams": [{ "value": "support", "label": "Customer support" }],
  "priorities": [{ "value": "high", "label": "High" }],
  "categories": [{ "value": "4", "label": "Technical" }],
  "channels": [{ "value": "email", "label": "Email" }]
}
```

Summary response below is an **illustrative contract example**, not actual CRM data. Missing KPI values may be `null`; chart series must be arrays (empty when there are no observations). Counts and durations must be nonnegative numbers. Percentage scores are 0–100. `label` is the display label (date, agent, category, or status).

```json
{
  "kpis": {
    "total_tickets": 100,
    "ticket_change_percent": 12,
    "resolved_tickets": 85,
    "resolved_percent": 85,
    "avg_response_seconds": 272,
    "response_change_percent": -8,
    "csat_percent": 92,
    "backlog": 15,
    "avg_resolution_seconds": 7200,
    "sla_compliance_percent": 96
  },
  "ticket_volume": [{ "label": "Nov 21", "tickets": 100 }],
  "ticket_status": [{ "label": "Open", "value": 15 }, { "label": "Resolved", "value": 85 }],
  "tickets_by_category": [{ "label": "Technical", "tickets": 100 }],
  "agent_performance": [{ "label": "Agent name", "resolved": 85 }],
  "csat_trend": [{ "label": "Nov 21", "score": 92 }],
  "response_resolution": [{ "label": "Nov 21", "response_minutes": 4.53, "resolution_minutes": 120 }]
}
```

The backend chooses daily/weekly/monthly buckets appropriate to the selected period and returns them in chronological order. `agent_performance` represents solved tickets per agent. Backlog is the number of unsolved tickets under the applied filters; SLA compliance is the percentage meeting the relevant response and resolution targets. Chart times are **minutes**, while KPI durations are **seconds**.

Save-report POST body: `{ "name": "Weekly support", "filters": { ...appliedFilters }, "charts": ["ticket_volume", "ticket_status", "tickets_by_category", "agent_performance", "csat_trend", "response_resolution"] }`.

Schedule POST adds `recipient` (email), `frequency` (`daily`, `weekly`, `monthly`), `time` (`HH:mm`), `timezone` (IANA), and `format: "pdf"`. Weekly schedules include `day_of_week: 1` (Monday, ISO numbering); monthly schedules include `day_of_month: 1`. Relative ranges must be evaluated anew at delivery time. Return a JSON object on success, such as `{ "id": 42 }`; return field errors or `detail` with a non-2xx status on failure. The frontend never sends an email itself or claims scheduling succeeded before the backend confirms it.

CSV export runs locally against the loaded report and includes all KPIs, chart data, and applied filter identifiers. Export PDF opens the browser print dialog; choose **Save as PDF**. Individual chart buttons download SVGs. Exports are disabled when data is loading or unavailable. Save and schedule use **applied** filters, not unsubmitted filter edits.

## Settings & Administration — frontend implementation and backend handoff

**Scope:** `Settings.jsx` and `Settings.css` implement six administration pages plus separate personal preferences. All settings requests are in `Settings.jsx`. No backend files or migrations were created. At inspection, `administration`, `accounts`, and `tickets` contained placeholder models/views; no organization/team/ticket domain models or application login, invitation delivery, notification delivery, or ticket composer were available to integrate. Django's built-in user/session/CSRF facilities exist, but an app session-context endpoint does not. The frontend shows a disconnected state until these services are supplied; it does not assume the visitor is an admin, manufacture audit records, use browser storage as persistence, or claim emails were sent.

### Connection and authentication

Default API base: `${VITE_API_BASE_URL}/administration`. Optional override: `VITE_SETTINGS_API_URL` (no trailing slash). Requests use `credentials: include`. Authenticated `GET /context/` must return the currently authorized organization, current user, teams, delivery capabilities, and a CSRF token issued by Django. Mutations send that token as `X-CSRFToken`. Keep session authentication, membership checks, and CSRF validation on the server. No passwords, access tokens, or credentials are stored in localStorage. Configure credentialed CORS and CSRF trusted origins for the frontend's exact origin when using different origins.

Illustrative context response, **not seed data**:

```json
{
  "organization": { "id": 1, "name": "Support workspace", "timezone": "Asia/Kolkata" },
  "current_user": { "id": 7, "name": "Admin name", "role": "Admin", "team_id": 2 },
  "csrf_token": "<session-issued CSRF token>",
  "teams": [{ "id": 2, "name": "Customer support", "active": true }],
  "capabilities": {
    "invitation_delivery": false,
    "notifications": { "assignments": false, "mentions": false, "sla_upcoming": false, "sla_missed": false }
  }
}
```

Roles are `Admin`, `Supervisor`, and `Agent`. The UI allows organization settings only for Admin and personal preferences for all three. It makes no organization-admin request for an Agent/Supervisor. **These UI gates are not server authorization.** Supervisor team/queue operations and Agent ticket operations still depend on the unimplemented ticket workspace and must not be implemented as organization-admin access.

### Endpoint contract

Paths below are relative to the settings base. Except context, GET responses use `{ "revision": "opaque-revision", "data": { ... } }`. The revision must represent the entire resource that will be edited; return it ready for the `If-Match` header (including quotes if using an HTTP ETag). Mutations send `If-Match`; the server must atomically reject stale writes with 409/412. Return a JSON object on successful mutations. The UI reloads canonical server data after success; it preserves form values on ordinary validation/network/conflict failures. 401/403 removes the verified context and requires a refresh/sign-in.

| Method | Path | Contract |
| --- | --- | --- |
| GET | `/context/` | Authenticated current organization, user, teams, capabilities, CSRF token |
| GET, PUT | `/organizations/{org}/general/` | `organization_name`, `support_display_name`, `default_language`, IANA `timezone`, `business_hours` |
| GET | `/organizations/{org}/users/` | Full `users` list, `teams`, authoritative `active_admin_count` |
| PATCH | `/organizations/{org}/users/{id}/` | Update `role`, `team_id`, or `status: inactive`; uses users-resource revision |
| POST | `/organizations/{org}/invitations/` | `{ name, email, role, team_id }`; uses users-resource revision; response includes `delivery_status` |
| POST | `/organizations/{org}/teams/` | `{ name }`; uses users-resource revision |
| GET, PUT | `/organizations/{org}/tickets/` | `statuses`, `priorities`, `categories`, `defaults` |
| GET, PUT | `/organizations/{org}/slas/` | `clock`, `version`, `targets` |
| GET | `/organizations/{org}/notifications/` | `defaults` and complete `replies` list |
| PUT | `/organizations/{org}/notifications/` | `{ defaults: { supported-event: boolean } }`; preserve unsupported event values |
| POST | `/organizations/{org}/replies/` | `{ title, body }`; uses notifications-resource revision |
| PATCH | `/organizations/{org}/replies/{id}/` | `{ title, body }` or `{ archived: true }`; uses notifications-resource revision |
| GET | `/organizations/{org}/audit/` | Read-only audit result with filters/pagination below |
| GET, PUT | `/me/preferences/` | `{ language, timezone }`; infer current user from session, never a user ID supplied by the client |

`general.business_hours` has exactly seven entries `{ day: 1..7, enabled: boolean, start: "09:00", end: "17:00" }`, Monday=1. Times are wall-clock times in the organization's IANA zone, not UTC/browser time. This first release supports one same-day interval per weekday; overnight periods must be split across days. Validate working hours again on the server and account for daylight-saving transitions when calculating deadlines.

`users`: `{ id, name, email, role, team_id, status }`; status can be `active`, `inactive`, or `invited`. `teams`: `{ id, name, active }`. Return the full current organization's membership snapshot (do not paginate this endpoint without adapting the UI). The client blocks demotion/deactivation of the last known active admin; **the server must lock/check active admin membership atomically**, including simultaneous role/deactivation changes. Never hard-delete users or cascade-delete ticket authorship/history. Invalidate deactivated users' sessions. Invitation delivery is disabled when capability is false; even when a request succeeds, the UI says sent only for `delivery_status: "sent"`. A queued invitation is not reported as delivered.

Ticket configuration:

```json
{
  "statuses": [{ "id": "open", "name": "Open", "active": true, "is_resolved": false }],
  "priorities": [{ "id": "normal", "name": "Normal", "active": true }],
  "categories": [{ "id": "technical", "name": "Technical", "active": true }],
  "defaults": { "status_id": "open", "priority_id": "normal", "team_id": 2 }
}
```

Array order is display order. New options have temporary `new-<uuid>` IDs; the server must create records, map references in `defaults` atomically to permanent IDs, and return canonical IDs on the next GET. Existing IDs must be reused and scoped to the organization. Omitted options must not be hard-deleted. Keep historical ticket labels/state snapshots and hide inactive options from creation/selection lists. Validate unique names within each option type and active defaults; the initial default status must not be resolved. Ticket categories are ticket configuration, not automatically the Knowledge Base category table. Reuse the eventual ticket model's categories rather than conflating two different domains.

SLA configuration:

```json
{
  "version": 3,
  "clock": "business_hours",
  "targets": [{ "priority_id": "normal", "priority_name": "Normal", "first_response_minutes": 60, "resolution_minutes": 480 }]
}
```

`clock` is `business_hours` or `continuous`. Return targets for all applicable active priorities. Targets are positive whole minutes. Resolution must be at least the first-response target. The server should create an immutable policy version, not mutate existing ticket snapshots. At ticket creation, snapshot policy version, response/resolution targets, calendar/timezone, and calculate applicable deadlines. A first public agent reply satisfies FRT; internal notes/customer replies do not. Entering a resolved state satisfies resolution. Decide and document ticket reopen behavior before integrating it. Existing tickets must keep their original policy/calendar/deadlines when organization policy or business hours change.

Notification defaults use `assignments`, `mentions`, `sla_upcoming`, `sla_missed`. Each capability must reflect an actually connected delivery service. Replies have `{ id, title, body, archived }`. Archived replies stay in history and are not offered for new insertion; plain text is rendered safely, not injected as HTML.

Audit query parameters: `from`, `to` (inclusive YYYY-MM-DD in organization timezone), `actor` (ID), `action`, `page` (1-based). Data response: `{ results: [{ id, created_at, actor_name, action, changed_fields: ["role", "team"] }], actors: [{id, name}], has_next: false }`. Supported action names are listed in `auditActions` in Settings.jsx. The UI shows only allowlisted changed-field names and never renders raw before/after values. The backend must write audit events transactionally with changes, record the authenticated actor and tenant, and exclude credentials/secrets **before storing** them. Read-only UI is not an immutable audit-store guarantee.

### Backend work still required (no migrations supplied here)

- Add organization-scoped configuration/membership/team models, or map this contract to existing production models. Reuse Django users. Choose a single default organization if the product is single-tenant; derive membership server-side.
- Implement authenticated, CSRF-protected endpoints with server authorization on every read/write and all foreign-key selections. Reject Agent/Supervisor requests to organization-admin endpoints and cross-organization requests even if a client alters the URL. Enforce role/team boundaries for ticket operations separately.
- Add immutable ticket defaults/history and SLA snapshots to the actual ticket creation/reply/state-transition services. Those services and the ticket composer do not exist yet in this checkout. Saved reply insertion and supervisor ticket-queue management therefore remain unimplemented.
- Connect actual invitation/internal-notification delivery; do not mark queued/failed messages as delivered. Schedule SLA alerts using server workers, not browser timers.
- Implement database persistence, atomic last-admin protection, concurrency revisions, and redacted audit storage. Run the backend team's schema migrations/initial organization setup after they implement these models. This frontend creates no migrations and requires no new npm packages.

### Verification boundary

Frontend build and client validation/request/UI tests can verify forms, submitted defaults/targets, permission-based rendering, CSRF/revision headers, missing-service messaging, and confirmations. They **cannot** prove DB persistence, server-side denial of Agent requests, atomic last-admin protection, audit immutability, actual delivery, or a newly created ticket's SLA deadlines. Required backend integration tests: admin saves and reloads after a new session; agent receives 403 from each admin endpoint; cross-tenant IDs fail; concurrent admin removals cannot remove the last admin; a real new ticket receives saved status/priority/team and SLA snapshot; an old ticket keeps its previous snapshot; first public agent replies and resolved transitions satisfy the correct targets; disabled users retain ticket history; audit never records secrets. Custom roles, routing rules, integrations, webhooks, and SSO are excluded.
