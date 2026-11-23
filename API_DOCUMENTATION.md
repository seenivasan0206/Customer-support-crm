# CUSTOMER SUPPORT CRM – BACKEND API DOCUMENTATION

**Base URL:** `http://localhost:8000`

---

## 📌 TABLE OF CONTENTS
1. [Authentication Architecture & JWT](#1-authentication-architecture--jwt)
2. [Module 1: Login & Authentication APIs](#2-module-1-login--authentication-apis)
   - [Register User](#21-register-user)
   - [Login User](#22-login-user)
   - [Get User Profile (Token Verification)](#23-get-user-profile-token-verification)
   - [Refresh JWT Token](#24-refresh-jwt-token)
   - [Logout User](#25-logout-user)
3. [Module 2: Support Requests (Tickets) APIs](#3-module-2-support-requests-tickets-apis)
   - [Create Ticket](#31-create-ticket)
   - [List Tickets (Pagination, Search & Filter)](#32-list-tickets-pagination-search--filter)
   - [Ticket Details](#33-ticket-details)
   - [Update Ticket](#34-update-ticket)
   - [Assign Ticket to Agent](#35-assign-ticket-to-agent)
   - [Delete Ticket](#36-delete-ticket)
4. [Module 3: Dashboard Overview APIs](#4-module-3-dashboard-overview-apis)
   - [Dashboard Overview Statistics](#41-dashboard-overview-statistics)
5. [Standard Error Formats & HTTP Status Codes](#5-standard-error-formats--http-status-codes)

---

## 1. Authentication Architecture & JWT

* **Type:** JSON Web Token (SimpleJWT)
* **Header Format:** `Authorization: Bearer <access_token>`
* **Access Token Lifetime:** 60 Minutes
* **Refresh Token Lifetime:** 1 Day
* **User Roles:**
  - `ADMIN`: System Manager (full access to tickets, assignments, all dashboard statistics).
  - `AGENT`: Support Staff (views assigned tickets, updates ticket status to Resolved).
  - `CUSTOMER`: End User (creates tickets, views own tickets, deletes only own open tickets).

---

## 2. Module 1: Login & Authentication APIs

### 2.1 Register User
* **Endpoint:** `/api/accounts/register/`
* **HTTP Method:** `POST`
* **Auth Requirement:** None (Public)
* **Request Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password@123",
  "role": "CUSTOMER",
  "phone": "9876543210"
}
```
* **Validation Rules:**
  - `username`: Required, unique.
  - `email`: Required, valid email format, unique.
  - `password`: Required, minimum 6 characters. Passwords are cryptographically hashed using PBKDF2-SHA256 before saving.
  - `role`: Optional (choices: `CUSTOMER`, `AGENT`, `ADMIN`. Defaults to `CUSTOMER`).

#### Response (`201 CREATED`)
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "phone": "9876543210",
    "date_joined": "2026-11-21T10:15:30.123456Z"
  }
}
```

#### Error Response (`400 BAD REQUEST`)
```json
{
  "email": ["user with this email already exists."],
  "password": ["Ensure this field has at least 6 characters."]
}
```

---

### 2.2 Login User
* **Endpoint:** `/api/accounts/login/`
* **HTTP Method:** `POST`
* **Auth Requirement:** None (Public)

#### Request Body
```json
{
  "username": "john_doe",
  "password": "Password@123"
}
```

#### Response (`200 OK`)
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

#### Error Response (`401 UNAUTHORIZED`)
```json
{
  "detail": "No active account found with the given credentials"
}
```

---

### 2.3 Get User Profile (Token Verification)
* **Endpoint:** `/api/accounts/profile/`
* **HTTP Method:** `GET`
* **Auth Requirement:** `Authorization: Bearer <access_token>`

#### Response (`200 OK`)
```json
{
  "id": 2,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "CUSTOMER",
  "phone": "9876543210",
  "date_joined": "2026-11-21T10:15:30.123456Z"
}
```

---

### 2.4 Refresh JWT Token
* **Endpoint:** `/api/accounts/token/refresh/`
* **HTTP Method:** `POST`
* **Auth Requirement:** None

#### Request Body
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (`200 OK`)
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2.5 Logout User
* **Endpoint:** `/api/accounts/logout/`
* **HTTP Method:** `POST`
* **Auth Requirement:** `Authorization: Bearer <access_token>`

#### Request Body
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (`200 OK`)
```json
{
  "message": "Logged out successfully"
}
```

---

## 3. Module 2: Support Requests (Tickets) APIs

### 3.1 Create Ticket
* **Endpoint:** `/api/tickets/`
* **HTTP Method:** `POST`
* **Auth Requirement:** `Authorization: Bearer <access_token>`

#### Request Body
```json
{
  "title": "Unable to access billing invoices",
  "description": "Whenever I click download invoice on account page, a 404 error appears.",
  "priority": "HIGH"
}
```
* **Validation Rules:**
  - `title`: Required, max 255 chars.
  - `description`: Required.
  - `priority`: Optional (Choices: `LOW`, `MEDIUM`, `HIGH`, `URGENT`. Defaults to `MEDIUM`).
  - `customer`: Automatically set to logged-in user from Bearer Token.
  - `ticket_id`: Auto-generated unique format `TCK-XXXXXXXX`.

#### Response (`201 CREATED`)
```json
{
  "id": 1,
  "ticket_id": "TCK-B91F8402",
  "title": "Unable to access billing invoices",
  "description": "Whenever I click download invoice on account page, a 404 error appears.",
  "priority": "HIGH"
}
```

---

### 3.2 List Tickets (Pagination, Search & Filter)
* **Endpoint:** `/api/tickets/`
* **HTTP Method:** `GET`
* **Auth Requirement:** `Authorization: Bearer <access_token>`
* **Role Visibility:**
  - `ADMIN`: Returns all tickets in system.
  - `AGENT`: Returns tickets assigned to agent + unassigned tickets.
  - `CUSTOMER`: Returns only tickets created by this customer.

#### Query Parameters
| Parameter | Example | Description |
|---|---|---|
| `page` | `?page=1` | Page number |
| `page_size` | `?page_size=10` | Items per page (default: 10, max: 50) |
| `search` | `?search=billing` | Searches `ticket_id`, `title`, `description`, customer username |
| `status` | `?status=OPEN` | Filter by `OPEN`, `PENDING`, `RESOLVED`, `CLOSED` |
| `priority` | `?priority=HIGH` | Filter by `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| `ordering` | `?ordering=-created_at` | Order by `created_at`, `priority`, `status` |

#### Response (`200 OK`)
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "ticket_id": "TCK-B91F8402",
      "title": "Unable to access billing invoices",
      "description": "Whenever I click download invoice on account page, a 404 error appears.",
      "customer": {
        "id": 2,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "CUSTOMER"
      },
      "assigned_to": null,
      "status": "OPEN",
      "priority": "HIGH",
      "created_at": "2026-11-21T10:30:00Z",
      "updated_at": "2026-11-21T10:30:00Z"
    }
  ]
}
```

---

### 3.3 Ticket Details
* **Endpoint:** `/api/tickets/<id>/`
* **HTTP Method:** `GET`
* **Auth Requirement:** `Authorization: Bearer <access_token>`

#### Response (`200 OK`)
Returns single ticket object with nested `customer` and `assigned_to` objects.

---

### 3.4 Update Ticket
* **Endpoint:** `/api/tickets/<id>/`
* **HTTP Method:** `PATCH` or `PUT`
* **Auth Requirement:** `Authorization: Bearer <access_token>`

#### Request Body
```json
{
  "status": "RESOLVED",
  "priority": "MEDIUM"
}
```

#### Response (`200 OK`)
Returns updated ticket object.

---

### 3.5 Assign Ticket to Agent
* **Endpoint:** `/api/tickets/<id>/assign/`
* **HTTP Method:** `POST`
* **Auth Requirement:** Admin or Agent only (`Authorization: Bearer <access_token>`)

#### Request Body
```json
{
  "agent_id": 3
}
```

#### Response (`200 OK`)
```json
{
  "message": "Ticket assigned to agent_sarah successfully",
  "ticket": {
    "id": 1,
    "ticket_id": "TCK-B91F8402",
    "status": "PENDING",
    "assigned_to": {
      "id": 3,
      "username": "agent_sarah",
      "email": "sarah@example.com",
      "role": "AGENT"
    }
  }
}
```

---

### 3.6 Delete Ticket
* **Endpoint:** `/api/tickets/<id>/`
* **HTTP Method:** `DELETE`
* **Auth Requirement:** `Authorization: Bearer <access_token>`
* **Business Rule:**
  - Admin can delete any ticket.
  - Customer can only delete if the ticket is their own and status is `OPEN`.
  - Agents cannot delete tickets.

#### Response (`204 NO CONTENT`)
Empty response indicating successful deletion.

---

## 4. Module 3: Dashboard Overview APIs

### 4.1 Dashboard Overview Statistics
* **Endpoint:** `/api/dashboard/overview/`
* **HTTP Method:** `GET`
* **Auth Requirement:** `Authorization: Bearer <access_token>`
* **Data Source:** Real MySQL database aggregation using Django ORM (`Count` with `filter=Q(...)`).

#### Response (`200 OK`)
```json
{
  "summary": {
    "total_tickets": 15,
    "open_tickets": 4,
    "pending_tickets": 6,
    "resolved_tickets": 3,
    "closed_tickets": 2
  },
  "priority_statistics": {
    "low": 2,
    "medium": 7,
    "high": 4,
    "urgent": 2
  },
  "recent_requests": [
    {
      "id": 15,
      "ticket_id": "TCK-C10A8829",
      "title": "Payment gateway timeout",
      "status": "OPEN",
      "priority": "URGENT",
      "customer": {
        "id": 5,
        "username": "ravi_kumar",
        "email": "ravi@example.com",
        "role": "CUSTOMER"
      },
      "created_at": "2026-11-21T11:45:00Z"
    }
  ]
}
```

---

## 5. Standard Error Formats & HTTP Status Codes

| Status Code | Meaning | When it occurs |
|---|---|---|
| `200 OK` | Success | Normal successful fetch or update |
| `201 CREATED` | Resource Created | User registered or Ticket created |
| `204 NO CONTENT` | Deleted | Ticket deleted successfully |
| `400 BAD REQUEST` | Validation Failed | Missing fields, weak password, duplicate email |
| `401 UNAUTHORIZED` | Not Authenticated | Missing or expired JWT Bearer token |
| `403 FORBIDDEN` | Permission Denied | Customer trying to assign ticket, or agent trying to delete ticket |
| `404 NOT FOUND` | Resource Not Found | Ticket ID or Agent ID does not exist |

#### Standard Validation Error Format
```json
{
  "field_name": [
    "Error description message."
  ]
}
```

#### Standard Permission Error Format
```json
{
  "detail": "You do not have permission to perform this action."
}
```
