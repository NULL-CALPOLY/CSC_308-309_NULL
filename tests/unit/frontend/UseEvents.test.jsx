import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useAllEvents,
  useUpcomingEvents,
  useEventId,
} from '../../../frontend/src/Hooks/UseEvents.jsx';

const mockEventData = [
  {
    _id: 'event1',
    name: 'Music Night',
    description: 'A great evening',
    time: {
      start: '2025-01-15T20:00:00.000Z',
      end: '2025-01-15T22:00:00.000Z',
    },
    address: '123 Main St',
    attendees: [],
    host: 'host1',
    interests: [{ name: 'Music' }, 'Tech'],
  },
];

const makeFetchMock = (data, success = true) =>
  jest.fn().mockResolvedValue({
    ok: success,
    json: () =>
      Promise.resolve(
        success ? { success: true, data } : { success: false, message: 'Error' }
      ),
  });

describe('useAllEvents', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts with loading true', () => {
    global.fetch = jest.fn(() => new Promise(() => {}));
    const { result } = renderHook(() => useAllEvents());
    expect(result.current.loading).toBe(true);
    expect(result.current.events).toEqual([]);
  });

  it('fetches and maps events on success', async () => {
    global.fetch = makeFetchMock(mockEventData);
    const { result } = renderHook(() => useAllEvents());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].eventName).toBe('Music Night');
    expect(result.current.events[0].id).toBe('event1');
  });

  it('maps interests correctly (object and string)', async () => {
    global.fetch = makeFetchMock(mockEventData);
    const { result } = renderHook(() => useAllEvents());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events[0].interests).toEqual(['Music', 'Tech']);
  });

  it('maps eventDate and eventTime from time.start and time.end', async () => {
    global.fetch = makeFetchMock(mockEventData);
    const { result } = renderHook(() => useAllEvents());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events[0].eventDate).toBeTruthy();
    expect(result.current.events[0].eventTime).toContain('–');
  });

  it('sets error on API failure', async () => {
    global.fetch = makeFetchMock(null, false);
    const { result } = renderHook(() => useAllEvents());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Error');
  });

  it('sets error on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useAllEvents());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network error');
  });

  it('uses "No address" when address is missing', async () => {
    const noAddress = [{ ...mockEventData[0], address: null }];
    global.fetch = makeFetchMock(noAddress);
    const { result } = renderHook(() => useAllEvents());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events[0].eventAddress).toBe('No address');
  });
});

describe('useUpcomingEvents', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts with loading true', () => {
    global.fetch = jest.fn(() => new Promise(() => {}));
    const { result } = renderHook(() => useUpcomingEvents());
    expect(result.current.loading).toBe(true);
  });

  it('fetches upcoming events on mount', async () => {
    global.fetch = makeFetchMock(mockEventData);
    const { result } = renderHook(() => useUpcomingEvents());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events).toHaveLength(1);
  });

  it('exposes a refetch function', async () => {
    global.fetch = makeFetchMock(mockEventData);
    const { result } = renderHook(() => useUpcomingEvents());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.refetch).toBe('function');
  });

  it('re-fetches events when refetch is called', async () => {
    global.fetch = makeFetchMock(mockEventData);
    const { result } = renderHook(() => useUpcomingEvents());
    await waitFor(() => expect(result.current.loading).toBe(false));

    global.fetch = makeFetchMock([
      { ...mockEventData[0], _id: 'event2', name: 'New Event' },
    ]);

    await act(async () => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events[0].eventName).toBe('New Event');
  });

  it('calls the /events/upcoming endpoint', async () => {
    global.fetch = makeFetchMock(mockEventData);
    renderHook(() => useUpcomingEvents());
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events/upcoming')
      );
    });
  });
});

describe('useEventId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts with loading true', () => {
    global.fetch = jest.fn(() => new Promise(() => {}));
    const { result } = renderHook(() => useEventId('event1'));
    expect(result.current.loading).toBe(true);
    expect(result.current.event).toBeUndefined();
  });

  it('fetches event by id on success', async () => {
    const rawEvent = mockEventData[0];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: rawEvent }),
    });

    const { result } = renderHook(() => useEventId('event1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.event).toEqual(rawEvent);
  });

  it('sets error on failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ success: false, message: 'Not found' }),
    });

    const { result } = renderHook(() => useEventId('event1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Not found');
  });

  it('calls the /events/:id endpoint', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockEventData[0] }),
    });
    renderHook(() => useEventId('abc123'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events/abc123')
      );
    });
  });
});
