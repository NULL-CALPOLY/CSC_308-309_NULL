import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../../frontend/src/Hooks/UseAuth.ts', () => ({
  useAuth: jest.fn(),
  AuthContext: { Provider: ({ children }) => children },
  useProvideAuth: jest.fn(),
}));

jest.mock('../../../frontend/src/Hooks/UseInterests.jsx', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    interests: [{ name: 'Music' }, { name: 'Tech' }],
    loading: false,
    error: null,
  })),
}));

const { useAuth } = require('../../../frontend/src/Hooks/UseAuth.ts');

import RegistrationModal from '../../../frontend/src/Components/Modals/RegistrationModal/RegistrationModal.jsx';

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSwitchToSignIn: jest.fn(),
};

const renderModal = (props = {}, auth = {}) => {
  const defaultAuth = {
    register: jest.fn().mockResolvedValue({}),
    loading: false,
    user: null,
    isAuthenticated: false,
  };
  useAuth.mockReturnValue({ ...defaultAuth, ...auth });
  return render(
    <MemoryRouter>
      <RegistrationModal {...defaultProps} {...props} />
    </MemoryRouter>
  );
};

// Fill in valid form data
const fillValidForm = () => {
  fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
    target: { value: 'test@example.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('••••••••'), {
    target: { value: 'Password1!' },
  });
  fireEvent.change(screen.getByPlaceholderText('Your name'), {
    target: { value: 'Alice Smith' },
  });
  fireEvent.change(screen.getByPlaceholderText('+1 2345678900'), {
    target: { value: '+12345678900' },
  });
  fireEvent.change(
    document.getElementById('reg-dob') ||
      screen.getByLabelText(/date of birth/i),
    {
      target: { value: '1990-01-01' },
    }
  );
  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: 'Female' },
  });
  fireEvent.change(screen.getByPlaceholderText('Your city'), {
    target: { value: 'New York' },
  });
};

describe('RegistrationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByText('Create account')).not.toBeInTheDocument();
  });

  it('renders the modal when isOpen is true', () => {
    renderModal();
    expect(screen.getByText('Create account')).toBeInTheDocument();
    expect(screen.getByText('Join Findr today')).toBeInTheDocument();
  });

  it('renders all required form fields', () => {
    renderModal();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+1 2345678900')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    renderModal();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onSwitchToSignIn when Sign In link is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByText('Sign in'));
    expect(defaultProps.onSwitchToSignIn).toHaveBeenCalled();
  });

  it('shows required field errors when submitted empty', async () => {
    renderModal();
    fireEvent.submit(
      screen.getByRole('button', { name: /create account/i }).closest('form')
    );
    await waitFor(() => {
      expect(screen.getByText('Email is required.')).toBeInTheDocument();
      expect(screen.getByText('Password is required.')).toBeInTheDocument();
    });
  });

  it('shows password rule errors for short password', async () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'abc' },
    });
    fireEvent.submit(
      screen.getByRole('button', { name: /create account/i }).closest('form')
    );
    await waitFor(() => {
      expect(
        screen.getByText('Must be at least 6 characters.')
      ).toBeInTheDocument();
    });
  });

  it('shows age validation error for underage DOB', async () => {
    renderModal();
    const today = new Date();
    const underageDob = new Date(
      today.getFullYear() - 17,
      today.getMonth(),
      today.getDate()
    );
    const dobStr = underageDob.toISOString().split('T')[0];
    // Fill minimum fields to get past other errors
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Passw0rd!' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your name'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByPlaceholderText('+1 2345678900'), {
      target: { value: '+12345678900' },
    });
    // set dob
    const dateInput = document.getElementById('reg-dob');
    fireEvent.change(dateInput, { target: { value: dobStr } });
    fireEvent.submit(
      screen.getByRole('button', { name: /create account/i }).closest('form')
    );
    await waitFor(() => {
      expect(
        screen.getByText('You must be at least 18 years old.')
      ).toBeInTheDocument();
    });
  });

  it('calls register with correct data on valid submit', async () => {
    const mockRegister = jest.fn().mockResolvedValue({});
    renderModal({}, { register: mockRegister });
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          name: 'Alice Smith',
          gender: 'Female',
          city: 'New York',
        })
      );
    });
  });

  it('shows submit error when register fails', async () => {
    const mockRegister = jest
      .fn()
      .mockRejectedValue(new Error('Email already in use'));
    renderModal({}, { register: mockRegister });
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
  });

  it('closes modal on Escape key', () => {
    renderModal();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    const { container } = renderModal();
    fireEvent.click(container.querySelector('.rmodal__overlay'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
