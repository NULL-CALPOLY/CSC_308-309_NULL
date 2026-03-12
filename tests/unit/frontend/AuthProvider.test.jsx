import { render, screen } from '@testing-library/react';
import { useContext } from 'react';

const mockAuthValue = {
  user: { id: 'user1', name: 'Alice' },
  isAuthenticated: true,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
};

jest.mock('../../../frontend/src/Hooks/UseAuth.ts', () => {
  const React = require('react');
  const AuthContext = React.createContext(null);
  return {
    AuthContext,
    useAuth: () => React.useContext(AuthContext),
    useProvideAuth: jest.fn(),
  };
});

const {
  AuthContext,
  useProvideAuth,
} = require('../../../frontend/src/Hooks/UseAuth.ts');
import { AuthProvider } from '../../../frontend/src/Components/AuthProvider.jsx';

function TestConsumer() {
  const auth = useContext(AuthContext);
  if (!auth) return <div>no auth</div>;
  return (
    <div>
      <span data-testid="user-name">{auth.user?.name}</span>
      <span data-testid="is-auth">
        {auth.isAuthenticated ? 'true' : 'false'}
      </span>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides auth context to children', () => {
    useProvideAuth.mockReturnValue(mockAuthValue);
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('user-name')).toHaveTextContent('Alice');
    expect(screen.getByTestId('is-auth')).toHaveTextContent('true');
  });

  it('renders children', () => {
    useProvideAuth.mockReturnValue(mockAuthValue);
    render(
      <AuthProvider>
        <div data-testid="child">Hello</div>
      </AuthProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('provides null/loading state from useProvideAuth', () => {
    useProvideAuth.mockReturnValue({
      ...mockAuthValue,
      isAuthenticated: false,
      user: null,
    });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('is-auth')).toHaveTextContent('false');
  });
});
