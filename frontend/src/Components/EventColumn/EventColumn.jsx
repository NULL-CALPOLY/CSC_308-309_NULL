// EventColumn.jsx
import EventComponent from '../EventComponent/EventComponent.jsx';
import './EventColumn.css';
import { useEffect, useState } from 'react';
import { useUpcomingEvents, useNearbyEvents } from '../../Hooks/UseEvents.jsx';
import SearchBar from '../SearchBar/SearchBar.jsx';

// 10-mile radius in metres
const NEARBY_RADIUS = 16093;

export default function EventColumn({ onRefetchReady, selectedId, onSelect, userCoords }) {
  const { events: allEvents, refetch } = useUpcomingEvents();
  const { events: nearbyEvents } = useNearbyEvents(userCoords, NEARBY_RADIUS);

  // When the user has shared location, show nearby events; otherwise show all upcoming
  const eventList = userCoords ? nearbyEvents : allEvents;

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    if (onRefetchReady) onRefetchReady(refetch);
  }, [refetch, onRefetchReady]);

  useEffect(() => {
    let filtered = eventList;
    if (selectedInterests.length > 0) {
      filtered = filtered.filter((event) =>
        event.interests.some((interest) => selectedInterests.includes(interest))
      );
    }
    if (dateRange.startDate) {
      const start = new Date(dateRange.startDate);
      filtered = filtered.filter((event) => new Date(event.eventStart) >= start);
    }
    if (dateRange.endDate) {
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter((event) => new Date(event.eventStart) <= end);
    }
    setFilteredEvents(filtered);
  }, [selectedInterests, dateRange, eventList]);

  return (
    <div className="Event_Container">
      <div className="Search_Bar">
        <SearchBar
          onSelectionChange={setSelectedInterests}
          onDateChange={setDateRange}
        />
      </div>
      {userCoords && (
        <div className="ec-nearby-badge">
          <span className="ec-nearby-dot" />
          Showing events within 10 miles
        </div>
      )}
      <div className="Event_List">
        {filteredEvents.length === 0 && (
          <div className="ec-empty">
            {userCoords ? 'No events found nearby.' : 'No upcoming events.'}
          </div>
        )}
        {filteredEvents.map((event) => (
          <EventComponent
            eventId={event.id}
            key={event.id}
            eventName={event.eventName}
            eventDate={event.eventDate}
            eventTime={event.eventTime}
            eventAddress={event.eventAddress}
            description={event.description}
            attendees={event.attendees}
            host={event.host}
            interest={event.interests.join(', ')}
            selected={event.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
