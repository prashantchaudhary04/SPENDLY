# Spendly: Expense Tracker (Client)

React 19, Vite, Tailwind CSS 4, React Router, Recharts, React Hook Form + Zod.

## Run (development)

```bash
npm install
npm run dev        # http://localhost:5173
```

The API must be running on http://localhost:5000. Vite proxies `/api` to it, so no CORS setup is needed in development.

## Deploy (Vercel)

1. Import the `client` folder as a Vercel project (framework: Vite).
2. Add the environment variable `VITE_API_URL=https://<your-api>.onrender.com/api`
3. On the server (Render) set `NODE_ENV=production` and `CLIENT_URL=https://<your-app>.vercel.app`

`vercel.json` already contains the rewrite that stops React Router pages from 404ing on refresh.

## How auth works

- The access token (15 min) is kept **in memory only**, never in localStorage.
- The refresh token is an httpOnly cookie that JavaScript can't read.
- `src/api/axios.js` attaches the token to each request. On a 401 it refreshes once (shared by parallel requests), then retries the failed request.
- On page load, `AuthContext` calls `/auth/refresh` to restore the session.
