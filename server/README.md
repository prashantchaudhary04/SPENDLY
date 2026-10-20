# Expense Tracker API

Node, Express, MongoDB (Mongoose). JWT auth with rotating refresh tokens.

## Run

```bash
npm install
cp .env.example .env     # fill in MONGO_URI and the two JWT secrets
npm run seed             # optional: demo@example.com / Demo@1234 with 6 months of data
npm run dev
```

## Endpoints (all except auth/register, auth/login, auth/refresh, auth/logout need `Authorization: Bearer <accessToken>`)

| Method | URL | Purpose |
|---|---|---|
| POST | /api/auth/register, /login, /refresh, /logout | Authentication |
| GET | /api/auth/me | Current user |
| GET/POST | /api/categories | List / create |
| PUT/DELETE | /api/categories/:id | Update / delete (blocked if in use) |
| GET | /api/transactions?page&limit&type&category&from&to&search&sortBy&order | Filtered, paginated list |
| GET | /api/transactions/export | Same filters, CSV download |
| POST | /api/transactions | Create (optional `recurrence`: daily/weekly/monthly) |
| GET/PUT/DELETE | /api/transactions/:id | Read / update / delete |
| GET | /api/budgets?month=2026-10 | Budgets with spent / remaining / status |
| POST | /api/budgets | Set (upsert) a budget `{category, month, limit}` |
| PUT/DELETE | /api/budgets/:id | Change limit / remove |
| GET | /api/analytics/summary?month= | Income, expense, balance |
| GET | /api/analytics/by-category?month=&type= | Totals per category |
| GET | /api/analytics/trend?months=6 | Income vs expense per month |
