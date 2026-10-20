import axios from 'axios';

// In development this is "/api" (proxied by Vite). In production, set VITE_API_URL.
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({ baseURL, withCredentials: true });

// The access token lives only in memory. It is never written to localStorage,
// so a script injected into the page can't steal it. The refresh token is an
// httpOnly cookie that JavaScript can't read at all.
let accessToken = null;
let onAuthFailure = () => {};

export const setAccessToken = (token) => {
  accessToken = token;
};
export const setAuthFailureHandler = (fn) => {
  onAuthFailure = fn;
};

// Attach the token to every request
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Only ONE refresh request may run at a time. If five requests fail together, they all
// wait for the same refresh. This matters because the server rotates refresh tokens:
// a second refresh with the old cookie would be treated as token theft and log you out.
let refreshPromise = null;

export function refreshSession() {
  if (!refreshPromise) {
    // Plain axios (not `api`) so this call can't trigger the interceptor below
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, null, { withCredentials: true })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        return res.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

const AUTH_URLS = /^\/auth\/(login|register|refresh|logout)/;

// If a request fails with 401 (expired access token): refresh once, then retry it.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && !AUTH_URLS.test(original.url || '')) {
      original._retry = true;
      try {
        await refreshSession();
        return api(original); // retry with the new token
      } catch {
        setAccessToken(null);
        onAuthFailure(); // refresh failed: the session is over
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
