# ServiceHub project guidance

This repository is the independent ServiceHub corporate website. It is not the STEM Academia project. Do not add catalog, cart, favorites, product, Bitrix24, AI-visualization, or STEM-specific functionality unless explicitly requested for ServiceHub.

## Project goal

ServiceHub v1.0 is a corporate website for receiving service requests from businesses in Kazakhstan.

The first version follows the provided technical specification:

- Home page
- Services
- About company
- Contacts
- Application form
- Admin panel
- Minimal corporate design: white, dark blue, light blue and gray
- Responsive/adaptive layout

Services in v1.0:

- Клининг
- Ремонт
- Электрика
- Сантехника
- Транспорт
- Спецтехника
- Озеленение

The application form contains:

- company
- contact person
- phone
- email
- object address
- service
- description
- optional photo

Application statuses are intentionally limited to:

- `new` — Новая
- `processing` — В работе
- `completed` — Выполнена

## Architecture

### Backend

FastAPI + SQLAlchemy + PostgreSQL + Alembic.

- Entry point: `backend-stem/main.py`
- Models: `backend-stem/models.py`
- Database: `backend-stem/database.py`
- Public applications: `routerss/servicehub_applications.py`
- Admin authentication: `routerss/servicehub_auth.py`
- Admin API: `routerss/servicehub_admin.py`
- Public photo upload: `routerss/servicehub_uploads.py`
- Uploaded files: `/app/uploads/`, exposed as `/uploads/<filename>`
- JWT is required for all admin endpoints.
- Public application submission does not require an account.

### Frontend

React + Vite + React Router.

- Entry point: `frontend-stem/src/main.jsx`
- Routes/UI: `frontend-stem/src/App.jsx`
- Styling: `frontend-stem/src/App.css` and `index.css`
- Production API uses relative `/api/*` paths through Nginx.

### Docker

`docker-compose.yml` runs:

- PostgreSQL
- FastAPI backend
- React/Nginx frontend
- Nginx Proxy Manager

The backend container applies Alembic migrations before starting Gunicorn.

## Environment

Create `backend-stem/.env` locally. Do not commit it.

Required:

- `SECRET_KEY`

For Docker Compose, database credentials default to the values in `docker-compose.yml` unless overridden by the project `.env`.

Admin bootstrap variables:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

The supplied `create_admin.py` script can create/promote the administrator after migrations.

## Development commands

Frontend:

```bash
cd frontend-stem
npm install
npm run dev
npm run build
npm run lint
```

Backend:

```bash
cd backend-stem
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload --port 8000
```

Full stack:

```bash
docker compose up --build
```

## Database migrations

The branch contains a migration that replaces the copied catalog schema with the ServiceHub `applications` schema. Keep the ServiceHub schema authoritative and do not reintroduce the old catalog tables.

For schema changes:

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Security

- Never commit `.env` or real credentials.
- Keep admin endpoints behind `get_current_admin`.
- Public photo uploads are limited to JPG/PNG/WebP and 5 MB.
- Validate user input on the backend even when the frontend also validates it.
- Do not expose admin pages or API endpoints in the sitemap.
