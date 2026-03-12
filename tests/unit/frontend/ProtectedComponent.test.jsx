import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../../frontend/src/Components/ProtectedComponent.jsx';

// Mock useAuth
jest.mock('../../../frontend/src/Hooks/UseAuth.ts', () => ({
  useAuth: jest.fn(),
  AuthContext: { Provider: ({ children }) => children },
  useProvideAuth: jest.fn(),
}));

const { useAuth } = require('../../../frontend/src/Hooks/UseAuth.ts');

const renderProtectedRoute = (authState) => {
  useAuth.mockReturnValue(authState);
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading when auth is loading', () => {
    renderProtectedRoute({ isAuthenticated: false, loading: true });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to / when not authenticated', () => {
    renderProtectedRoute({ isAuthenticated: false, loading: false });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    renderProtectedRoute({ isAuthenticated: true, loading: false });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('does not render protected content when not authenticated', () => {
    renderProtectedRoute({ isAuthenticated: false, loading: false });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
