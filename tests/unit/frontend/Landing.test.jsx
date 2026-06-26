import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../../frontend/src/Hooks/UseAuth.ts', () => ({
  useAuth: jest.fn(),
  AuthContext: { Provider: ({ children }) => children },
  useProvideAuth: jest.fn(),
}));

jest.mock('../../../frontend/src/Components/ModalContext.jsx', () => ({
  useModal: jest.fn(() => ({
    openSignIn: jest.fn(),
    openRegister: jest.fn(),
    closeAll: jest.fn(),
  })),
  ModalProvider: ({ children }) => children,
}));

jest.mock('../../../frontend/src/Components/Navbar/Navbar.jsx', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

// Mock SVG/video assets
jest.mock('../../../frontend/src/assets/community.svg', () => 'community.svg', {
  virtual: true,
});
jest.mock('../../../frontend/src/assets/LEBRON.mp4', () => 'LEBRON.mp4', {
  virtual: true,
});

const { useAuth } = require('../../../frontend/src/Hooks/UseAuth.ts');
const {
  useModal,
} = require('../../../frontend/src/Components/ModalContext.jsx');

import LandingPage from '../../../frontend/src/Pages/Landing/Landing.jsx';

const renderLanding = (authOverrides = {}) => {
  const defaultAuth = { isAuthenticated: false, user: null, loading: false };
  useAuth.mockReturnValue({ ...defaultAuth, ...authOverrides });

  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
};

describe('LandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Findr hero title', () => {
    renderLanding();
    expect(screen.getByText('Findr')).toBeInTheDocument();
  });

  it('renders the Navbar', () => {
    renderLanding();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders the hero subtitle', () => {
    renderLanding();
    expect(
      screen.getByText(/Your go-to platform for connecting with others/i)
    ).toBeInTheDocument();
  });

  it('renders "Get Started!" button when not authenticated', () => {
    renderLanding();
    const btn = screen.getByRole('button', { name: /get started/i });
    expect(btn).toBeInTheDocument();
  });

  it('calls openRegister when "Get Started!" is clicked and not authenticated', () => {
    const mockOpenRegister = jest.fn();
    useModal.mockReturnValue({
      openSignIn: jest.fn(),
      openRegister: mockOpenRegister,
      closeAll: jest.fn(),
    });
    renderLanding();
    fireEvent.click(screen.getByRole('button', { name: /get started/i }));
    expect(mockOpenRegister).toHaveBeenCalled();
  });

  it('renders "Get Started!" as a Link to /home when authenticated', () => {
    renderLanding({ isAuthenticated: true });
    const link = screen.getAllByText('Get Started!')[0].closest('a');
    expect(link).toHaveAttribute('href', '/home');
  });

  it('renders feature sections: Smart Matchmaking, Event Creation', () => {
    renderLanding();
    expect(screen.getByText('Smart Matchmaking')).toBeInTheDocument();
    expect(screen.getByText('Event Creation & RSVP')).toBeInTheDocument();
    expect(screen.getByText('Safety & Verification')).toBeInTheDocument();
  });

  it('renders "Learn More" button when not authenticated', () => {
    renderLanding();
    expect(
      screen.getByRole('button', { name: /learn more/i })
    ).toBeInTheDocument();
  });

  it('renders community image', () => {
    renderLanding();
    expect(screen.getByAltText('Community')).toBeInTheDocument();
  });

  it('shows "Be part of a community" heading', () => {
    renderLanding();
    expect(screen.getByText('Be part of a community')).toBeInTheDocument();
  });

  it('calls openSignIn when "Join the Community" is clicked and not authenticated', () => {
    const mockOpenSignIn = jest.fn();
    useModal.mockReturnValue({
      openSignIn: mockOpenSignIn,
      openRegister: jest.fn(),
      closeAll: jest.fn(),
    });
    renderLanding();
    fireEvent.click(
      screen.getByRole('button', { name: /join the community/i })
    );
    expect(mockOpenSignIn).toHaveBeenCalled();
  });
});
