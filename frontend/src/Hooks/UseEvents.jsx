import { useState, useEffect } from 'react';

export default function FetchEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}events/all`
        );
        const result = await response.json();

        if (result.success) {
          console.log('Events fetched successfully:', result.data);
          setEvents(result.data);
        } else {
          console.warn('Failed to fetch events:', result.message);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  return events;
}