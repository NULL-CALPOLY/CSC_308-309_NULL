// EventColumn.jsx
import EventComponent from '../EventComponent/EventComponent.jsx';
import './EventColumn.css';
import { useEffect, useState } from 'react';
import { useUpcomingEvents } from '../../Hooks/UseEvents.jsx';
import SearchBar from '../SearchBar/SearchBar.jsx';

export default function EventColumn({ onRefetchReady, selectedId, onSelect }) {
  const { events: eventList, refetch } = useUpcomingEvents();
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
    // Date filter
    if (dateRange.startDate) {
      const start = new Date(dateRange.startDate);
      filtered = filtered.filter(
        (event) => new Date(event.eventStart) >= start
      );
    }
    if (dateRange.endDate) {
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59); // include the full end day
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
      <div className="Event_List">
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
