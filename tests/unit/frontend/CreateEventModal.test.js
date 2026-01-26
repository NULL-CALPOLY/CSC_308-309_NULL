//CreateEventModal.test.js to test CreateEventModal.jsx


// Mock TempAddressComponent to set a fixed address
// TempAddressComponent mock
jest.mock(
  '../../../frontend/src/Components/TempAddressInputComponent/TempAddressComponent.jsx',
  () => {
    return function MockAddress({ setAddress }) {
      if (setAddress) setAddress('123 Main St'); // call it immediately
      return <div data-testid="mock-address-button">Select Address</div>;
    };
  }
);

// MultiSelect mock
jest.mock('@cloudscape-design/components/multiselect', () => {
  return {
    __esModule: true,
    default: ({ setSelectedItems }) => {
      if (setSelectedItems) setSelectedItems([{ id: 1, name: 'Music' }]); // call immediately
      return <div data-testid="mock-multiselect">MultiSelect Mock</div>;
    },
  };
});



import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CreateEventModal from '../../../frontend/src/Components/CreateEventModal/CreateEventModal.jsx';
// import '../../__mocks__/cloudscape.js';

const mockOnClose = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  // Mock fetch
  global.fetch = jest.fn((url, options) => {
    if (url.includes('/interests')) {
      return Promise.resolve({
        json: () =>
          Promise.resolve([
            { id: 1, name: 'Music' },
            { id: 2, name: 'Sports' },
          ]),
      });
    }

    if (url.includes('/events')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Event created' }),
      });
    }

    return Promise.reject(new Error('Unknown fetch'));
  });
});

afterEach(() => {
  global.fetch.mockRestore();
});

describe('CreateEventModal', () => {
  it('renders modal when isOpen is true', async () => {
    await act(async () => {
      render(<CreateEventModal isOpen={true} onClose={mockOnClose} />);
    });

    expect(screen.getByRole('heading', { name: /create event/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter event title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/describe your event/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-address-button')).toBeInTheDocument();
  });

  it('submits form with selected interest', async () => {
    await act(async () => {
      render(<CreateEventModal isOpen={true} onClose={mockOnClose} />);
    });

    // Fill inputs
    fireEvent.change(screen.getByPlaceholderText(/enter event title/i), {
      target: { value: 'Test Event' },
    });
    fireEvent.change(screen.getByPlaceholderText(/describe your event/i), {
      target: { value: 'Fun Event' },
    });

    // Select address
    fireEvent.click(screen.getByTestId('mock-address-button'));

    // Fill start/end times
    const now = new Date();
    const startTime = now.toISOString().slice(0, 16);
    const endTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);

    fireEvent.change(screen.getByLabelText(/start time/i), { target: { value: startTime } });
    fireEvent.change(screen.getByLabelText(/end time/i), { target: { value: endTime } });

    // Select first interest (simulate)
    const multiselectButton = screen.getByTestId('mock-multiselect');
    fireEvent.click(multiselectButton);
    // If your component tracks selected interests in state, you may need to directly mock state or handler
    // For simplicity, assume clicking the button selects "Music"

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create event/i }));

    await waitFor(() => {
      // Make sure POST /events fetch was called
      const postCall = global.fetch.mock.calls.find(call => call[0].includes('/events'));
      expect(postCall).toBeDefined();
      expect(postCall[1]).toEqual(
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );

      // Modal should close
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
