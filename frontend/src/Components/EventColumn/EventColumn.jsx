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

  const eventList = userCoords ? nearbyEvents : allEvents;

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const activeFilterCount = selectedInterests.length + (dateRange.startDate ? 1 : 0) + (dateRange.endDate ? 1 : 0);

  return (
    <div className="Event_Container">
      {/* ── Collapsible filter toggle ── */}
      <button
        className="ec-filter-toggle"
        onClick={() => setFiltersOpen((v) => !v)}
        aria-expanded={filtersOpen}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <line x1="4" y1="18" x2="10" y2="18" />
        </svg>
        Filters
        {activeFilterCount > 0 && (
          <span className="ec-filter-badge">{activeFilterCount}</span>
        )}
        <svg
          className={`ec-filter-chevron${filtersOpen ? ' open' : ''}`}
          width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {filtersOpen && (
        <div className="Search_Bar">
          <SearchBar
            onSelectionChange={setSelectedInterests}
            onDateChange={setDateRange}
          />
        </div>
      )}

      {userCoords && (
        <div className="ec-nearby-badge">
          <span className="ec-nearby-dot" />
          Showing events within 10 miles
        </div>
      )}

      {/* ── Event count ── */}
      <div className="ec-count">
        {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        {activeFilterCount > 0 ? ' matching filters' : userCoords ? ' nearby' : ' upcoming'}
      </div>

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
