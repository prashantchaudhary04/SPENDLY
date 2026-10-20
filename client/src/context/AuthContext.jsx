import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAccessToken, setAuthFailureHandler, refreshSession } from '../api/axios.js';

const AuthContext = createContext(null);

export const DEMO_EMAIL = 'demo@example.com';
export const DEMO_PASSWORD = 'Demo@1234';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing session

  useEffect(() => {
    // If the API says our session is dead, drop the user (ProtectedRoute then redirects to /login)
    setAuthFailureHandler(() => setUser(null));

    // On page load the access token (in memory) is gone, but the refresh cookie may still be valid.
    refreshSession()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(email, password) {
        const { data } = await api.post('/auth/login', { email, password });
        setAccessToken(data.accessToken);
        setUser(data.user);
      },
      async register(name, email, password) {
        const { data } = await api.post('/auth/register', { name, email, password });
        setAccessToken(data.accessToken);
        setUser(data.user);
      },
      async logout() {
        try {
          await api.post('/auth/logout');
        } finally {
          setAccessToken(null);
          setUser(null);
        }
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
