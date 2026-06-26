import { Navigate } from 'react-router-dom';
import { useAuth } from '../Hooks/UseAuth.ts';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080808',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(248,250,252,0.5)',
        fontSize: '0.9rem',
      }}>
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
