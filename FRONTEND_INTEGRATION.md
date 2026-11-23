# FRONTEND REACT INTEGRATION GUIDE

This document is prepared for the **React Frontend Developer** integrating with the Customer Support CRM Django Backend.

---

## 1. Backend Server Details
* **API Base URL:** `http://localhost:8000`
* **Content-Type:** `application/json`
* **Authentication Method:** JWT Bearer Token (`Authorization: Bearer <access_token>`)
* **CORS Status:** Enabled for `http://localhost:3000` and `http://localhost:5173` (Vite)

> [!SECURITY NOTE]
> Never store database credentials in React code. The frontend only communicates through the documented REST API endpoints.

---

## 2. Authentication Flow (JWT)

1. **Login Request:** Send `username` and `password` to `/api/accounts/login/`.
2. **Response:** Backend returns `access`, `refresh`, and user profile data including `role`:
   ```javascript
   {
     "access": "eyJhbGciOi...",
     "refresh": "eyJhbGciOi...",
     "user": {
       "id": 1,
       "username": "karthik",
       "email": "karthik@example.com",
       "role": "ADMIN" // "ADMIN" | "AGENT" | "CUSTOMER"
     }
   }
   ```
3. **Storage:** Store `access` and `refresh` in `localStorage` or secure state.
4. **Role Redirection:**
   - `ADMIN` ➔ Redirect to `/admin/dashboard`
   - `AGENT` ➔ Redirect to `/agent/tickets`
   - `CUSTOMER` ➔ Redirect to `/support-requests`

---

## 3. Axios Client Setup Example (`src/api/client.js`)

Create a pre-configured Axios instance with automatic token attachment and token refresh interceptor:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const { data } = await axios.post('http://localhost:8000/api/accounts/token/refresh/', {
          refresh: refreshToken,
        });

        localStorage.setItem('access_token', data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 4. Key Endpoints Quick Reference

### Authentication
* `POST /api/accounts/register/` — User Registration
* `POST /api/accounts/login/` — Login & Token Generation
* `GET  /api/accounts/profile/` — Authenticated User Profile
* `POST /api/accounts/logout/` — Logout & Invalidate Refresh Token

### Support Requests (Tickets)
* `GET    /api/tickets/?page=1&page_size=10` — List tickets with pagination
* `GET    /api/tickets/?search=query` — Search tickets
* `GET    /api/tickets/?status=OPEN&priority=HIGH` — Filter tickets
* `POST   /api/tickets/` — Create new ticket (`title`, `description`, `priority`)
* `GET    /api/tickets/:id/` — Get ticket details
* `PATCH  /api/tickets/:id/` — Update ticket (`status`, `priority`)
* `POST   /api/tickets/:id/assign/` — Assign ticket to agent (`agent_id`)
* `DELETE /api/tickets/:id/` — Delete ticket

### Dashboard Overview
* `GET /api/dashboard/overview/` — Real-time aggregate statistics:
  - `data.summary`: Total, Open, Pending, Resolved, Closed ticket counts
  - `data.priority_statistics`: Low, Medium, High, Urgent ticket counts
  - `data.recent_requests`: Array of latest 5 tickets

---

## 5. Postman Collection Import
A complete Postman collection is exported at `Backend/postman_collection.json`. 
Import this file into Postman to test all endpoints with pre-configured requests and token auto-save scripts.
