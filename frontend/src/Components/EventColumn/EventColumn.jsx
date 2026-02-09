// EventColumn.jsx
import EventComponent from '../EventComponent/EventComponent.jsx';
import './EventColumn.css';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import SearchBar from '../SearchBar/SearchBar.jsx';

export default function EventColumn() {
  const [eventList, setEventList] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);

  // Fetch events once
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}events/all`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        const mappedEvents = data.data.map((event) => {
          const start = new Date(event.time.start);
          const end = new Date(event.time.end);
          const eventTime = `${format(start, 'MMM do h:mm a')} - ${format(end, 'h:mm a')}`;
          const eventAddress = event.address ?? 'No address';

          return {
            eventName: event.name,
            description: event.description,
            eventTime,
            eventAddress,
            attendees: event.attendees,
            host: event.host,
            interests: event.interests, // <-- keep as array for filtering
          };
        });

        setEventList(mappedEvents);
        setFilteredEvents(mappedEvents); // show all initially
      })
      .catch((err) => console.error('Failed to load events:', err));
  }, []);

  // Update filtered events whenever selectedInterests changes
  useEffect(() => {
    if (selectedInterests.length === 0) {
      setFilteredEvents(eventList); // no filter
    } else {
      const filtered = eventList.filter((event) =>
        event.interests.some((interest) => selectedInterests.includes(interest))
      );
      setFilteredEvents(filtered);
    }
  }, [selectedInterests, eventList]);

  return (
    <div className="Event_Container">
      <div className="Search_Bar">
        <SearchBar onSelectionChange={setSelectedInterests} />
      </div>
      <div className="Event_List">
        {filteredEvents.map((event, index) => (
          <EventComponent
            key={index}
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
    </div>
  );
}
