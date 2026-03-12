import { renderHook, waitFor } from '@testing-library/react';
import useInterests from '../../../frontend/src/Hooks/UseInterests.jsx';

describe('useInterests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with loading true and empty interests', () => {
    global.fetch = jest.fn(() => new Promise(() => {}));
    const { result } = renderHook(() => useInterests());
    expect(result.current.loading).toBe(true);
    expect(result.current.interests).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('returns interests on successful fetch', async () => {
    const mockInterests = [{ name: 'Music' }, { name: 'Tech' }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockInterests }),
    });

    const { result } = renderHook(() => useInterests());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.interests).toEqual(mockInterests);
    expect(result.current.error).toBeNull();
  });

  it('sets error when API returns success: false', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ success: false, message: 'Not found' }),
    });

    const { result } = renderHook(() => useInterests());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Not found');
    expect(result.current.interests).toEqual([]);
  });

  it('sets error when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useInterests());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.interests).toEqual([]);
  });

  it('sets loading to false after fetch completes', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    const { result } = renderHook(() => useInterests());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('calls fetch with the interests/all endpoint', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    renderHook(() => useInterests());

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/interests/all')
      );
    });
  });
});
