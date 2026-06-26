import { render, screen, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../../frontend/src/Hooks/UseAuth.ts', () => ({
  useAuth: jest.fn(() => ({ user: null, isAuthenticated: false })),
  AuthContext: { Provider: ({ children }) => children },
  useProvideAuth: jest.fn(),
}));

jest.mock('../../../frontend/src/Components/ModalContext.jsx', () => ({
  useModal: jest.fn(() => ({ openSignIn: jest.fn() })),
  ModalProvider: ({ children }) => children,
}));

const mockRefetch = jest.fn();
const mockEvents = [
  {
    id: '1',
    eventName: 'Music Night',
    eventDate: 'Mon, Jan 1',
    eventTime: '8:00 PM – 10:00 PM',
    eventAddress: '123 Main St',
    description: 'Fun event',
    attendees: [],
    host: 'host1',
    interests: ['Music'],
    eventStart: '2025-01-01T20:00:00.000Z',
  },
  {
    id: '2',
    eventName: 'Tech Talk',
    eventDate: 'Tue, Jan 2',
    eventTime: '6:00 PM – 8:00 PM',
    eventAddress: '456 Oak Ave',
    description: 'Tech event',
    attendees: [],
    host: 'host2',
    interests: ['Tech'],
    eventStart: '2025-01-02T18:00:00.000Z',
  },
];
const mockUseUpcomingEventsResult = {
  events: mockEvents,
  loading: false,
  error: null,
  refetch: mockRefetch,
};
jest.mock('../../../frontend/src/Hooks/UseEvents.jsx', () => ({
  useUpcomingEvents: jest.fn(),
  useNearbyEvents: jest.fn(),
}));

// Minimal mock for sub-components to focus on EventColumn logic
jest.mock('../../../frontend/src/Components/SearchBar/SearchBar.jsx', () => ({
  __esModule: true,
  default: ({ onSelectionChange, onDateChange }) => (
    <div data-testid="search-bar">
      <button onClick={() => onSelectionChange(['Music'])}>Filter Music</button>
      <button
        onClick={() =>
          onDateChange({ startDate: '2025-01-02', endDate: '2025-01-02' })
        }>
        Filter Date
      </button>
      <button onClick={() => onSelectionChange([])}>Clear Filter</button>
      <button onClick={() => onDateChange({ startDate: '', endDate: '' })}>
        Clear Date
      </button>
    </div>
  ),
}));

jest.mock(
  '../../../frontend/src/Components/EventComponent/EventComponent.jsx',
  () => ({
    __esModule: true,
    default: ({ eventName }) => <div data-testid="event-item">{eventName}</div>,
  })
);

const {
  useUpcomingEvents,
  useNearbyEvents,
} = require('../../../frontend/src/Hooks/UseEvents.jsx');

import EventColumn from '../../../frontend/src/Components/EventColumn/EventColumn.jsx';

const renderEventColumn = (props = {}) =>
  render(
    <MemoryRouter>
      <EventColumn {...props} />
    </MemoryRouter>
  );

describe('EventColumn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUpcomingEvents.mockReturnValue(mockUseUpcomingEventsResult);
    useNearbyEvents.mockReturnValue({ events: [], loading: false, error: null });
  });

  const openFilters = () => {
    act(() => {
      screen.getByText('Filters').click();
    });
  };

  it('renders the SearchBar when filters panel is open', () => {
    renderEventColumn();
    openFilters();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders all events initially', () => {
    renderEventColumn();
    expect(screen.getByText('Music Night')).toBeInTheDocument();
    expect(screen.getByText('Tech Talk')).toBeInTheDocument();
  });

  it('filters events by selected interest', () => {
    renderEventColumn();
    openFilters();
    act(() => {
      screen.getByText('Filter Music').click();
    });
    expect(screen.getByText('Music Night')).toBeInTheDocument();
    expect(screen.queryByText('Tech Talk')).not.toBeInTheDocument();
  });

  it('shows all events again after clearing interest filter', () => {
    renderEventColumn();
    openFilters();
    act(() => {
      screen.getByText('Filter Music').click();
    });
    act(() => {
      screen.getByText('Clear Filter').click();
    });
    expect(screen.getByText('Music Night')).toBeInTheDocument();
    expect(screen.getByText('Tech Talk')).toBeInTheDocument();
  });

  it('filters events by interest (confirms filtering logic works)', async () => {
    renderEventColumn();
    openFilters();
    act(() => {
      screen.getByText('Filter Music').click();
    });
    await waitFor(() => {
      expect(screen.getByText('Music Night')).toBeInTheDocument();
      expect(screen.queryByText('Tech Talk')).not.toBeInTheDocument();
    });
  });

  it('calls onRefetchReady with the refetch function when provided', () => {
    const onRefetchReady = jest.fn();
    renderEventColumn({ onRefetchReady });
    expect(onRefetchReady).toHaveBeenCalledWith(mockRefetch);
  });

  it('renders correct number of event items', () => {
    renderEventColumn();
    expect(screen.getAllByTestId('event-item')).toHaveLength(2);
  });
});
