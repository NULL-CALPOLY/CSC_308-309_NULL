// Hooks/useInterests.js
import { useState, useEffect, useCallback } from 'react';

export default function useInterests() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/interests/all`
        );
        const result = await response.json();

        if (result.success) {
          setInterests(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, []);

  // Server-side typeahead — scales past the initially loaded list.
  const searchInterests = useCallback(async (q) => {
    if (!q || !q.trim()) return [];
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/interests/search?q=${encodeURIComponent(
          q.trim()
        )}`
      );
      if (!res.ok) return [];
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  }, []);

  // Create a user-suggested interest. The backend normalizes + dedupes, so this
  // returns the existing interest if one already matches.
  const createInterest = useCallback(async (name) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/interests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || 'Could not add interest');
    return json.data;
  }, []);

  return { interests, loading, error, searchInterests, createInterest };
}
