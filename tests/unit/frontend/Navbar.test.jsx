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
    showSignIn: false,
    showRegister: false,
  })),
  ModalProvider: ({ children }) => children,
}));

const { useAuth } = require('../../../frontend/src/Hooks/UseAuth.ts');
const {
  useModal,
} = require('../../../frontend/src/Components/ModalContext.jsx');

import Navbar from '../../../frontend/src/Components/Navbar/Navbar.jsx';

const renderNavbar = (props = {}) =>
  render(
    <MemoryRouter>
      <Navbar {...props} />
    </MemoryRouter>
  );

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('unauthenticated state', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        logout: jest.fn(),
        user: null,
      });
    });

    it('renders the Findr logo', () => {
      renderNavbar();
      expect(screen.getByText('Findr')).toBeInTheDocument();
    });

    it('renders Map link', () => {
      renderNavbar();
      expect(screen.getByText('Map')).toBeInTheDocument();
    });

    it('shows Sign In button', () => {
      renderNavbar();
      expect(
        screen.getByRole('button', { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it('shows Sign Up button', () => {
      renderNavbar();
      expect(
        screen.getByRole('button', { name: /sign up/i })
      ).toBeInTheDocument();
    });

    it('calls openSignIn when Sign In is clicked', () => {
      const mockOpenSignIn = jest.fn();
      useModal.mockReturnValue({
        openSignIn: mockOpenSignIn,
        openRegister: jest.fn(),
        closeAll: jest.fn(),
      });
      renderNavbar();
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      expect(mockOpenSignIn).toHaveBeenCalled();
    });

    it('calls openRegister when Sign Up is clicked', () => {
      const mockOpenRegister = jest.fn();
      useModal.mockReturnValue({
        openSignIn: jest.fn(),
        openRegister: mockOpenRegister,
        closeAll: jest.fn(),
      });
      renderNavbar();
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
      expect(mockOpenRegister).toHaveBeenCalled();
    });

    it('does not show Logout button', () => {
      renderNavbar();
      expect(
        screen.queryByRole('button', { name: /logout/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('authenticated state', () => {
    const mockLogout = jest.fn();

    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
        user: { name: 'Alice', avatar: null },
      });
    });

    it('shows Logout button', () => {
      renderNavbar();
      expect(
        screen.getByRole('button', { name: /logout/i })
      ).toBeInTheDocument();
    });

    it('calls logout when Logout is clicked', () => {
      renderNavbar();
      fireEvent.click(screen.getByRole('button', { name: /logout/i }));
      expect(mockLogout).toHaveBeenCalled();
    });

    it('does not show Sign In or Sign Up buttons', () => {
      renderNavbar();
      expect(
        screen.queryByRole('button', { name: /sign in/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /sign up/i })
      ).not.toBeInTheDocument();
    });

    it('renders profile initial when no avatar', () => {
      renderNavbar();
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('renders profile avatar img when user has avatar', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
        user: { name: 'Alice', avatar: 'https://example.com/avatar.png' },
      });
      renderNavbar();
      expect(screen.getByAltText('Profile')).toBeInTheDocument();
    });
  });
});
