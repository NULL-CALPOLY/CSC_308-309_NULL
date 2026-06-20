// Hooks/useEvents.js
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function useAllEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/events/all`
        );
        const result = await response.json();

        if (result.success) {
          setEvents(mapEvents(result.data));
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
}

export function useUpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/events/upcoming`
      );
      const result = await response.json();
      if (result.success) {
        setEvents(mapEvents(result.data));
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refetch: fetchEvents };
}

// Bounded, location-aware feed: upcoming events within `radiusMeters` of a
// point, using the indexed /events/nearby endpoint. Pass coords = null to stay
// idle (e.g. until the user's location is known).
export function useNearbyEvents(coords, radiusMeters = 16093) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lat = coords?.lat;
  const lng = coords?.lng;

  useEffect(() => {
    if (lat == null || lng == null) {
      setEvents([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      lng: String(lng),
      lat: String(lat),
      radius: String(radiusMeters),
    });
    fetch(`${import.meta.env.VITE_API_BASE_URL}/events/nearby?${params}`)
      .then((res) => res.json())
      .then((result) => {
        if (!active) return;
        if (result.success) setEvents(mapEvents(result.data));
        else {
          setEvents([]);
          setError(result.message);
        }
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [lat, lng, radiusMeters]);

  return { events, loading, error };
}

export function useEventId(id) {
  const [event, setEvent] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/events/${id}`
        );
        const result = await response.json();

        if (result.success) {
          setEvent(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, []);

  return { event, loading, error };
}

// ── Shared mapping function ──
function mapEvents(data) {
  return data.map((event) => {
    const start = new Date(event.time.start);
    const end = new Date(event.time.end);
    const eventDate = format(start, 'EEE, MMM d');
    const startTime = format(start, 'h:mm a');
    const endTime = format(end, 'h:mm a');
    const eventTime = `${startTime} – ${endTime}`;
    const eventAddress = event.address ?? 'No address';

    const interests = event.interests.map((i) =>
      typeof i === 'object' ? i.name : i
    );

    const [lng, lat] = event.location?.coordinates ?? [0, 0];

    return {
      id: event._id,
      eventName: event.name,
      description: event.description,
      eventDate,
      eventTime,
      eventAddress,
      attendees: event.attendees,
      host: event.host,
      interests,
      eventStart: event.time.start,
      lat,
      lng,
    };
  });
}
