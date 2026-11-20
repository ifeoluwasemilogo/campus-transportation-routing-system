# Ibadan Campus Transport

A campus transportation MVP with a React student/admin portal and a Django REST API. It supports role-based sign-in, scheduled shuttle trips, seat-limited reservations, cancellations, service notices, and fleet/route management.

## Requirements

- Node.js 20.19+ and npm
- Python 3.10+
- SQLite for local development (included with Python)
- MySQL and `mysqlclient` for production deployments

## Local setup

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements\development.txt
Copy-Item .env.example .env
```

Set `SECRET_KEY`, `STUDENT_PASSWORD`, and `ADMIN_PASSWORD` in `backend\.env`. Keep `.env` private. The example uses SQLite; MySQL can be selected with `DB_ENGINE=mysql` and the `DB_*` settings.

Initialize the development database and starter data:

```powershell
python manage.py migrate
python manage.py seed_roles_permissions
python manage.py seed_users
python manage.py seed_transport_data
python manage.py runserver 127.0.0.1:8001
```

The development account emails default to `student@ui.edu.ng` and `admin@ui.edu.ng`; their passwords are the values configured in `.env`. User seeding is disabled when `DEBUG=False`.

### Frontend

In another PowerShell window:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`. In local development, Vite proxies `/api` requests to Django at `http://127.0.0.1:8001`. Set `VITE_API_BASE_URL` in `frontend\.env` when deploying the frontend separately from the API.

## Core workflows

- Students can register from the sign-in page; registrations always create student accounts and enforce Django's password validators.
- Each browser/device keeps its own login tokens. Signing in or out on one device does not invalidate another device's refresh token.
- Students authenticate against Django and see routes, upcoming departures, notices, seat availability, and their bookings.
- Booking reserves a seat on the next available scheduled trip; capacity and route fares are enforced by the API.
- Students can cancel their own bookings before departure.
- Admins can inspect bookings and manage routes, fleet, trips, and notices entirely from the React operations dashboard.
- The route map is an illustrative preview, not live GPS tracking or turn-by-turn routing.

## API

- `POST /api/accounts/login/`
- `POST /api/accounts/register/` to create a student account (never accepts a client-selected role)
- `POST /api/accounts/logout/` to revoke the refresh token
- `POST /api/accounts/token/refresh/` with a refresh token; access tokens are only for `Authorization: Bearer ...` API requests
- `GET /api/transport/dashboard/student/`
- `GET|POST /api/transport/bookings/`
- `PATCH /api/transport/bookings/{id}/` to cancel an owned booking
- `GET /api/transport/dashboard/admin/`
- `GET /api/transport/admin/bookings/` (admin only)
- Admin-only route, vehicle, trip, and notice CRUD: `GET|POST /api/transport/admin/{routes,vehicles,trips,notices}/` and `GET|PATCH|DELETE .../{id}/`
- OpenAPI schema and Swagger UI: `/api/schema/` and `/api/docs/`

## Checks

```powershell
cd backend
python manage.py check
python manage.py test apps.accounts apps.transport

cd ..\frontend
npm run build
npm run lint
```

Seed commands are intended for local development. Before production use, configure a strong secret key, MySQL credentials, allowed hosts, CORS origins, HTTPS, account lifecycle/password reset, and deployment monitoring. Payment processing, push notifications, and live vehicle GPS are not configured in this MVP.
