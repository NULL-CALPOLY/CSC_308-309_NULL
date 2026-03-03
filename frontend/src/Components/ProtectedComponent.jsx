// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth.ts';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  console.log('Auth:', isAuthenticated, 'Loading:', loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
