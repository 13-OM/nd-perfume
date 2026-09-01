import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Guards customer-only routes (account, checkout details). */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to={`/auth?mode=login&next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return children;
}
