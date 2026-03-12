import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../../frontend/src/Hooks/UseAuth.ts', () => ({
  useAuth: jest.fn(),
  AuthContext: { Provider: ({ children }) => children },
  useProvideAuth: jest.fn(),
}));

jest.mock('../../../frontend/src/Components/ModalContext.jsx', () => ({
  useModal: jest.fn(() => ({ openSignIn: jest.fn() })),
  ModalProvider: ({ children }) => children,
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const { useAuth } = require('../../../frontend/src/Hooks/UseAuth.ts');
const {
  useModal,
} = require('../../../frontend/src/Components/ModalContext.jsx');

import EventComponent from '../../../frontend/src/Components/EventComponent/EventComponent.jsx';

const defaultProps = {
  eventId: 'event123',
  eventName: 'Test Event',
  eventDate: 'Mon, Jan 1',
  eventTime: '12:00 PM – 2:00 PM',
  eventAddress: '123 Main St',
  interest: 'Music,Tech',
  host: 'host456',
  attendees: [],
};

const renderEvent = (props = {}, authOverrides = {}) => {
  const defaultAuth = {
    user: null,
    isAuthenticated: false,
    loading: false,
  };
  useAuth.mockReturnValue({ ...defaultAuth, ...authOverrides });

  return render(
    <MemoryRouter>
      <EventComponent {...defaultProps} {...props} />
    </MemoryRouter>
  );
};

describe('EventComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ success: true, data: { name: 'Host User' } }),
    });
  });

  it('renders the event name', () => {
    renderEvent();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('renders event date and time', () => {
    renderEvent();
    expect(screen.getByText('📅 Mon, Jan 1')).toBeInTheDocument();
    expect(screen.getByText('🕒 12:00 PM – 2:00 PM')).toBeInTheDocument();
  });

  it('renders the event address as a link', () => {
    renderEvent();
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('123 Main St');
  });

  it('shows "No address" when eventAddress is not provided', () => {
    renderEvent({ eventAddress: null });
    expect(
      screen.getByText(/no address/i, { exact: false })
    ).toBeInTheDocument();
  });

  it('shows Sign in to join when not authenticated', () => {
    renderEvent();
    expect(screen.getByText('Sign in to join')).toBeInTheDocument();
  });

  it('calls openSignIn when "Sign in to join" is clicked', () => {
    const mockOpenSignIn = jest.fn();
    useModal.mockReturnValue({ openSignIn: mockOpenSignIn });
    renderEvent();
    fireEvent.click(screen.getByText('Sign in to join'));
    expect(mockOpenSignIn).toHaveBeenCalled();
  });

  it('shows Join Event when authenticated and not attending', () => {
    renderEvent(
      {},
      { user: { id: 'user789', token: 'tok' }, isAuthenticated: true }
    );
    expect(screen.getByText('Join Event')).toBeInTheDocument();
  });

  it('shows Leave Event when authenticated and already attending', () => {
    renderEvent(
      { attendees: ['user789'] },
      { user: { id: 'user789', token: 'tok' }, isAuthenticated: true }
    );
    expect(screen.getByText('Leave Event')).toBeInTheDocument();
  });

  it('shows Edit Event when authenticated user is host', () => {
    renderEvent(
      { host: 'host456' },
      { user: { id: 'host456', token: 'tok' }, isAuthenticated: true }
    );
    expect(screen.getByText('Edit Event')).toBeInTheDocument();
  });

  it('navigates to event page when Edit Event is clicked', () => {
    renderEvent(
      { host: 'host456' },
      { user: { id: 'host456', token: 'tok' }, isAuthenticated: true }
    );
    fireEvent.click(screen.getByText('Edit Event'));
    expect(mockNavigate).toHaveBeenCalledWith('/events/event123');
  });

  it('navigates to event details when View Event is clicked', () => {
    renderEvent(
      {},
      { user: { id: 'user789', token: 'tok' }, isAuthenticated: true }
    );
    fireEvent.click(screen.getByText('View Event'));
    expect(mockNavigate).toHaveBeenCalledWith('/events/event123');
  });

  it('calls fetch to add attendee on Join Event click', async () => {
    renderEvent(
      {},
      { user: { id: 'user789', token: 'tok' }, isAuthenticated: true }
    );
    fireEvent.click(screen.getByText('Join Event'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events/event123/attendees/add/user789'),
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  it('shows Leave Event after joining', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    renderEvent(
      {},
      { user: { id: 'user789', token: 'tok' }, isAuthenticated: true }
    );
    fireEvent.click(screen.getByText('Join Event'));
    await waitFor(() => {
      expect(screen.getByText('Leave Event')).toBeInTheDocument();
    });
  });

  it('fetches host name when host is an id string', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ success: true, data: { name: 'Jane Doe' } }),
    });
    renderEvent({ host: 'someHostId' }, { user: null, isAuthenticated: false });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/someHostId')
      );
    });
  });

  it('shows only up to 3 interest tags', () => {
    renderEvent({ interest: 'Music,Tech,Sports,Art' });
    // Only first 3 tags rendered
    const tags = document.querySelectorAll(
      '.interest-tag, .tag-container, .Tag-List > *'
    );
    // At most 3 rendered (rough check)
    expect(screen.queryByText('Art')).not.toBeInTheDocument();
  });
});
