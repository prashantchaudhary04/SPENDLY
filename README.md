
# Spendly — Expense Tracker

A full-stack personal finance application built with the **MERN stack**. Track income and expenses, manage monthly budgets, and visualize spending patterns using charts powered by MongoDB aggregation pipelines.

**Live Demo:** [Spendly]() 

**Demo Login:** `demo@example.com` / `Demo@1234`

You can also click **Try the demo account** on the login page.

<!-- Add screenshots here -->
<!-- ![Dashboard](docs/dashboard.png) -->

---

## ✨ Features

### 🔐 Authentication & Security
- User registration and login using JWT authentication.
- Short-lived access tokens (15 minutes).
- Rotating refresh tokens (7 days) stored in `httpOnly` cookies.
- Access tokens stored in memory.
- Rate-limited login and registration endpoints.
- Input validation and centralized error handling.

### 💸 Transaction Management
- Add, edit, and delete income and expense transactions.
- Search transaction notes.
- Filter by transaction type, category, and date range.
- Sort by date or amount and paginate results.
- Automatically generate recurring daily, weekly, and monthly transactions.
- Export filtered transactions to CSV.

### 📂 Categories & Budgets
- 12 default categories for every new user.
- Create custom categories with colors and icons.
- Set monthly budgets for individual categories.
- Track spending with progress bars.
- View budget statuses: On Track, Almost There, and Over Budget.
- Receive over-budget warnings on the dashboard and Budgets page.

### 📊 Dashboard & Analytics
- View total income, expenses, monthly balance, and all-time savings.
- Visualize spending by category using a donut chart.
- Compare monthly income and expenses using a six-month trend chart.
- Select any month to review financial activity.
- Generate analytics using MongoDB aggregation pipelines.

### 🎨 User Interface
- Responsive design for desktop, tablet, and mobile.
- Mobile drawer navigation.
- Dark mode with saved theme preference.
- Loading, empty, and error states across pages.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Routing | React Router |
| Charts | Recharts |
| Forms & Validation | React Hook Form, Zod |
| HTTP Client | Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Security | Helmet, CORS, express-rate-limit |
| Scheduling | node-cron |
| Deployment | Vercel, Render, MongoDB Atlas |

---

## 📁 Project Structure

```text
expense-tracker/
├── server/
│   └── src/
│       ├── config/         # Database connection
│       ├── controllers/    # Business and request logic
│       ├── jobs/           # Recurring transaction scheduler
│       ├── middleware/     # Authentication and validation
│       ├── models/         # User, Category, Transaction, Budget
│       ├── routes/         # API route definitions
│       ├── utils/          # Tokens, dates, CSV, default categories
│       ├── validators/     # Zod validation schemas
│       ├── app.js          # Express app configuration
│       ├── server.js       # Server entry point
│       └── seed.js         # Demo data generator
│
└── client/
    └── src/
        ├── api/             # Axios and token refresh logic
        ├── components/     # UI, layout, charts, feature components
        ├── context/        # Authentication and theme state
        ├── hooks/          # Custom React hooks
        ├── pages/          # Login, Register, Dashboard, etc.
        └── utils/          # Formatting helpers
```

### Backend Request Flow

```text
Client Request
      ↓
    Routes
      ↓
Middleware
(Authentication & Validation)
      ↓
  Controllers
      ↓
    Models
      ↓
   MongoDB
```

Errors are handled by a centralized error-handling middleware.

---


## 🔒 Security & Architecture

### Authentication Flow

1. The user logs in with their email and password.
2. The server returns a short-lived access token and sets a refresh token in an `httpOnly` cookie.
3. Axios attaches the access token to protected requests.
4. When the access token expires, the client requests a new token pair using the refresh endpoint.
5. The client retries the original request after successful refresh.

### Security Measures

- Access tokens are stored in memory rather than browser storage.
- Refresh tokens use `httpOnly` cookies.
- Refresh tokens are rotated and their hashes are stored server-side.
- Login and registration endpoints are rate-limited.
- Inputs are validated before reaching business logic.
- Database queries are scoped to the authenticated user.
- Centralized error handling provides consistent API responses.








---


**Built with ❤️ by Prashant Chaudhary using the MERN stack.**
