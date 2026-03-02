import EventComponent from '../EventComponent/EventComponent.jsx';
import './EventColumn.css';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import SearchBar from '../SearchBar/SearchBar.jsx';

export default function EventColumn() {
  const [eventList, setEventList] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [limit, setLimit] = useState(10); // initial fetch limit
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch events
  const fetchEvents = async (lat, lng, fetchLimit) => {
    if (!lat || !lng) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/events/nearby?lat=${lat}&lng=${lng}&limit=${fetchLimit}`
      );
      const data = await res.json();
      if (!data.success) return;

      const mappedEvents = data.data.map((event) => {
        const start = new Date(event.time.start);
        const end = new Date(event.time.end);
        return {
          id: event._id,
          eventName: event.name,
          description: event.description,
          eventTime: `${format(start, 'MMM do h:mm a')} - ${format(end, 'h:mm a')}`,
          eventAddress: event.address ?? 'No address',
          attendees: event.attendees,
          host: event.host,
          interests: event.interests,
        };
      });

      setEventList(mappedEvents);
      setFilteredEvents(mappedEvents);
      setHasMore(mappedEvents.length >= fetchLimit); // if less than limit, no more events
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get user location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setLatitude(latitude);
      setLongitude(longitude);
      fetchEvents(latitude, longitude, limit);
    });
  }, []);

  // Filter by interests
  useEffect(() => {
    if (selectedInterests.length === 0) {
      setFilteredEvents(eventList);
    } else {
      const filtered = eventList.filter((event) =>
        event.interests.some((interest) => selectedInterests.includes(interest))
      );
      setFilteredEvents(filtered);
    }
  }, [selectedInterests, eventList]);

  // Load more events
  const loadMore = () => {
    const newLimit = limit + 10; // load 10 more each time
    setLimit(newLimit);
    fetchEvents(latitude, longitude, newLimit);
  };

  return (
    <div className="Event_Container">
      <div className="Search_Bar">
        <SearchBar onSelectionChange={setSelectedInterests} />
      </div>

      <div className="Event_List">
        {filteredEvents.map((event) => (
          <EventComponent
            key={event.id}
            eventId={event.id}
            eventName={event.eventName}
            eventTime={event.eventTime}
            eventAddress={event.eventAddress}
            description={event.description}
            attendees={event.attendees}
            host={event.host}
            interest={event.interests.join(', ')}
          />
        ))}
      </div>

      {hasMore && (
        <button
          className="Load_More_Button"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More Events'}
        </button>
      )}
    </div>
  );
}