import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../../frontend/src/Hooks/UseAuth.ts', () => ({
  useAuth: jest.fn(),
  AuthContext: { Provider: ({ children }) => children },
  useProvideAuth: jest.fn(),
}));

const { useAuth } = require('../../../frontend/src/Hooks/UseAuth.ts');

import SignInModal from '../../../frontend/src/Components/Modals/SignInModal/SignInModal.jsx';

const defaultAuth = {
  login: jest.fn(),
  user: null,
  isAuthenticated: false,
  loading: false,
  error: '',
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSwitchToRegister: jest.fn(),
};

const renderModal = (props = {}, auth = {}) => {
  useAuth.mockReturnValue({ ...defaultAuth, ...auth });
  return render(
    <MemoryRouter>
      <SignInModal {...defaultProps} {...props} />
    </MemoryRouter>
  );
};

describe('SignInModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByText('Welcome back')).not.toBeInTheDocument();
  });

  it('renders the modal when isOpen is true', () => {
    renderModal();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    renderModal();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('calls onClose when clicking close button', () => {
    renderModal();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onSwitchToRegister when Register is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByText('Register'));
    expect(defaultProps.onSwitchToRegister).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    const { container } = renderModal();
    fireEvent.click(container.querySelector('.modal__overlay'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('updates email and password fields on change', () => {
    renderModal();
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls login on form submit with correct credentials', async () => {
    const mockLogin = jest.fn().mockResolvedValue({});
    renderModal({}, { login: mockLogin });

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows error message when login fails', async () => {
    const mockLogin = jest
      .fn()
      .mockRejectedValue(new Error('Invalid credentials'));
    renderModal({}, { login: mockLogin });

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'bad@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows Signing in... while loading', async () => {
    const mockLogin = jest.fn(() => new Promise(() => {})); // never resolves
    renderModal({}, { login: mockLogin });

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
  });

  it('closes modal on Escape key press', () => {
    renderModal();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('restores body overflow on unmount', () => {
    const { unmount } = renderModal();
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
