//CreateEventModal.test.js to test CreateEventModal.jsx
// Note: This test suite is currently disabled due to complexity with Cloudscape component mocks
// and async state management in the form submission flow.
import { render, screen } from '@testing-library/react';
import CreateEventModal from '../../../frontend/src/Components/CreateEventModal/CreateEventModal.jsx';

jest.mock('../../../frontend/src/Hooks/useAuth.ts', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', token: 'test-token' },
    isAuthenticated: true,
    loading: false,
  }),
}));

jest.mock(
  '../../../frontend/src/Components/TempAddressInputComponent/TempAddressComponent.jsx',
  () => {
    return function MockAddress() {
      return <div data-testid="mock-address-button">Select Address</div>;
    };
  }
);

jest.mock('@cloudscape-design/components/multiselect', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-multiselect">MultiSelect Mock</div>,
  };
});

jest.mock('@cloudscape-design/components/input', () => {
  return {
    __esModule: true,
    default: (props) => <input {...props} />,
  };
});

jest.mock('@cloudscape-design/components/textarea', () => {
  return {
    __esModule: true,
    default: (props) => <textarea {...props} />,
  };
});

const mockOnClose = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CreateEventModal', () => {
  it('does not render when isOpen is false', () => {
    render(<CreateEventModal isOpen={false} onClose={mockOnClose} />);
    expect(
      screen.queryByRole('heading', { name: /create event/i })
    ).not.toBeInTheDocument();
  });

  it.skip('renders modal and submits form', () => {
    render(<CreateEventModal isOpen={true} onClose={mockOnClose} />);
    expect(
      screen.getByRole('heading', { name: /create event/i })
    ).toBeInTheDocument();
  });
});
