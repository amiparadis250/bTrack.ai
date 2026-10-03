# bTrack.ai

**Track your business. Understand your money. Grow smarter.**

bTrack.ai is an AI-ready financial management platform for small and medium
businesses in Rwanda. This repo contains the Next.js frontend and the FastAPI
backend for: authentication, business onboarding, transaction tracking, a
dashboard with real financial KPIs, analytics, a Gemini-backed AI Assistant,
proactive AI Insights, and PDF/Excel report generation.

## Architecture

```
bTrack/
├── frontend/       Next.js App Router frontend
│   ├── app/            Pages
│   ├── components/     React components (ui/ = shared primitives)
│   ├── lib/            Client + server helpers, typed API fetchers
│   └── types/          Shared TypeScript types mirroring the backend schemas
└── backend/        FastAPI + SQLAlchemy + Alembic + PostgreSQL
```

The backend is the source of truth for every financial number. The frontend
never computes totals, profit, or cash flow -- it only formats what the API
returns.

## Frontend setup

Requires Node.js 20+.

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Pages live in `frontend/app/`.

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

Environment variables (`frontend/.env`):

```
BACKEND_API_URL=http://localhost:8000/api/v1
```

## Backend setup

Requires Python 3.11+ and a running PostgreSQL server.

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate   # Windows Git Bash; use .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env            # edit DATABASE_URL / SECRET_KEY for your machine
```

### PostgreSQL setup

Create the database (adjust user/password to match your local Postgres):

```bash
psql -U postgres -c "CREATE DATABASE btrack;"
```

### Database migrations

```bash
cd backend
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

### Run the API

```bash
cd backend
uvicorn app.main:app --reload
```

Swagger / OpenAPI docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Tests

```bash
cd backend
pytest
```

Tests create and drop a separate `btrack_test` database automatically (same
server as `DATABASE_URL`, database name suffixed with `_test`).

### Environment variables (`backend/.env`)

```
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/btrack
SECRET_KEY=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000
GEMINI_API_KEY=
```

`GEMINI_API_KEY` powers the AI Assistant (`/ai/chat`). Without it, that one
endpoint returns a clean 503 ("AI Assistant isn't configured yet") -- every
other feature works with no AI key at all, per the spec's AI-failure-handling
requirement.

Never commit real secrets -- `backend/.env` and the root `.env` are gitignored.

## API overview

All endpoints are under `/api/v1`:

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me

PATCH  /users/me
POST   /users/me/change-password

GET    /businesses
POST   /businesses
GET    /businesses/{id}
PATCH  /businesses/{id}

GET    /businesses/{id}/categories
POST   /businesses/{id}/categories

GET    /businesses/{id}/transactions
POST   /businesses/{id}/transactions
GET    /businesses/{id}/transactions/{transaction_id}
PUT    /businesses/{id}/transactions/{transaction_id}
DELETE /businesses/{id}/transactions/{transaction_id}

GET    /businesses/{id}/analytics/overview
GET    /businesses/{id}/analytics/trend
GET    /businesses/{id}/analytics/expense-breakdown

POST   /businesses/{id}/ai/chat

GET    /businesses/{id}/insights

GET    /businesses/{id}/reports
POST   /businesses/{id}/reports
GET    /businesses/{id}/reports/{report_id}/download
```




