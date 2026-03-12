import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Heavy component mocks to prevent deep render
jest.mock('../../../frontend/src/Pages/Home/HomePage.jsx', () => ({
  __esModule: true,
  default: () => <div data-testid="home-page">HomePage</div>,
}));

jest.mock('../../../frontend/src/Pages/Landing/Landing.jsx', () => ({
  __esModule: true,
  default: () => <div data-testid="landing-page">LandingPage</div>,
}));

jest.mock('../../../frontend/src/Pages/Profile/Profile.jsx', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-page">Profile</div>,
}));

jest.mock('../../../frontend/src/Pages/EventDetails/EventDetails.jsx', () => ({
  __esModule: true,
  default: () => <div data-testid="event-details-page">EventDetails</div>,
}));

jest.mock(
  '../../../frontend/src/Components/Modals/SignInModal/SignInModal.jsx',
  () => ({
    __esModule: true,
    default: () => null,
  })
);

jest.mock(
  '../../../frontend/src/Components/Modals/RegistrationModal/RegistrationModal.jsx',
  () => ({
    __esModule: true,
    default: () => null,
  })
);

jest.mock('../../../frontend/src/Components/AuthProvider.jsx', () => ({
  AuthProvider: ({ children }) => children,
}));

jest.mock('../../../frontend/src/Components/ModalContext.jsx', () => ({
  ModalProvider: ({ children }) => children,
  useModal: jest.fn(() => ({
    showSignIn: false,
    showRegister: false,
    openSignIn: jest.fn(),
    openRegister: jest.fn(),
    closeAll: jest.fn(),
  })),
}));

jest.mock('../../../frontend/src/Hooks/UseAuth.ts', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    loading: false,
  })),
  AuthContext: { Provider: ({ children }) => children },
  useProvideAuth: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    loading: false,
  })),
}));

// ProtectedRoute mock based on isAuthenticated
const { useAuth } = require('../../../frontend/src/Hooks/UseAuth.ts');
jest.mock('../../../frontend/src/Components/ProtectedComponent.jsx', () => {
  const { useAuth } = require('../../../frontend/src/Hooks/UseAuth.ts');
  return {
    __esModule: true,
    default: ({ children }) => {
      const { isAuthenticated } = useAuth();
      if (!isAuthenticated) {
        return <div data-testid="redirect">Redirected</div>;
      }
      return children;
    },
  };
});

import App from '../../../frontend/src/App.jsx';

const renderApp = (initialRoute = '/') =>
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  );

describe('App', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    jest.clearAllMocks();
  });

  it('renders LandingPage at /', () => {
    renderApp('/');
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('renders HomePage at /home', () => {
    renderApp('/home');
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders 404 for unknown routes', () => {
    renderApp('/nonexistent');
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('redirects /profile when not authenticated', () => {
    renderApp('/profile');
    expect(screen.getByTestId('redirect')).toBeInTheDocument();
  });

  it('renders Profile when authenticated', () => {
    useAuth.mockReturnValue({
      user: { id: 'u1' },
      isAuthenticated: true,
      loading: false,
    });
    renderApp('/profile');
    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
  });

  it('redirects /events/:id when not authenticated', () => {
    renderApp('/events/abc123');
    expect(screen.getByTestId('redirect')).toBeInTheDocument();
  });

  it('renders EventDetails when authenticated', () => {
    useAuth.mockReturnValue({
      user: { id: 'u1' },
      isAuthenticated: true,
      loading: false,
    });
    renderApp('/events/abc123');
    expect(screen.getByTestId('event-details-page')).toBeInTheDocument();
  });

  it('renders about page at /about', () => {
    renderApp('/about');
    expect(screen.getByText('About')).toBeInTheDocument();
  });
});
