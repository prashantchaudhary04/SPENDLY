import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../ui/Spinner.jsx';

// Wraps every private page. Not logged in -> /login (remembering where they wanted to go).
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-indigo-600">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

// Wraps /login and /register. Already logged in -> go to the app.
export function PublicRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-indigo-600">
        <Spinner size="lg" />
      </div>
    );
  }
  if (user) return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  return <Outlet />;
}
