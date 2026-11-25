# Customer Support CRM - Backend

Django backend for the Customer Support CRM application.

## Tech Stack
- Python 3.10+
- Django & Django REST Framework
- SimpleJWT (JSON Web Tokens)
- MySQL (`customer_support_crm`)

## Default Login Credentials (Pre-seeded)

The default administrator account is automatically created upon running migrations:

- **Email / Username**: `admin@gmail.com` (or `admin`)
- **Password**: `admin123`
- **Role**: `ADMIN` (Superuser & Staff)

---

## Installation & Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate environment:
- Windows:
```bash
venv\Scripts\activate
```
- macOS / Linux:
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run Database Migrations (This also seeds the default admin user):
```bash
python manage.py migrate
```

5. Start the Development Server:
```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000/`

---

## Main API Modules
- `/api/accounts/` - Authentication, Login, Register, Profile, Token Refresh, Logout
- `/api/dashboard/` - Real-time aggregated ticket metrics and recent requests
- `/api/tickets/` - Support requests CRUD, assignments, and status updates
- `/api/customers/` - Customer management and subscription plans
- `/api/agents/` - Agent roster and availability management
- `/api/conversations/` - Live chat and messaging
- `/api/knowledge/` - Knowledge base categories and articles
- `/api/reports/` - Reports & analytics
- `/api/settings/` - System settings and administration
