// EventColumn.jsx
import EventComponent from '../EventComponent/EventComponent.jsx';
import './EventColumn.css';
import { useEffect, useState } from 'react';
import { useUpcomingEvents, useNearbyEvents } from '../../Hooks/UseEvents.jsx';
import SearchBar from '../SearchBar/SearchBar.jsx';

const NEARBY_RADIUS = 16093;

function EventSkeleton() {
  return (
    <div className="ec-skeleton">
      <div className="ec-sk-title" />
      <div className="ec-sk-meta" />
      <div className="ec-sk-meta ec-sk-meta--sm" />
    </div>
  );
}

export default function EventColumn({ onRefetchReady, selectedId, onSelect, userCoords }) {
  const { events: allEvents, loading: loadingAll, refetch } = useUpcomingEvents();
  const { events: nearbyEvents, loading: loadingNearby } = useNearbyEvents(userCoords, NEARBY_RADIUS);
  const loading = userCoords ? loadingNearby : loadingAll;

  const eventList = userCoords ? nearbyEvents : allEvents;

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [textQuery, setTextQuery] = useState('');

  useEffect(() => {
    if (onRefetchReady) onRefetchReady(refetch);
  }, [refetch, onRefetchReady]);

  useEffect(() => {
    let filtered = eventList;
    if (textQuery.trim()) {
      const q = textQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.eventName.toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q) ||
          (e.eventAddress || '').toLowerCase().includes(q)
      );
    }
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
  }, [selectedInterests, dateRange, eventList, textQuery]);

  const activeFilterCount =
    selectedInterests.length + (dateRange.startDate ? 1 : 0) + (dateRange.endDate ? 1 : 0);
  const hasAnyFilter = activeFilterCount > 0 || textQuery.trim().length > 0;

  const clearAll = () => {
    setTextQuery('');
    setSelectedInterests([]);
    setDateRange({ startDate: '', endDate: '' });
  };

  return (
    <div className="Event_Container">
      {/* ── Text search ── */}
      <div className="ec-search-wrap">
        <svg className="ec-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          className="ec-search-input"
          type="search"
          placeholder="Search events…"
          value={textQuery}
          onChange={(e) => setTextQuery(e.target.value)}
          aria-label="Search events"
        />
        {textQuery && (
          <button
            className="ec-search-clear"
            onClick={() => setTextQuery('')}
            aria-label="Clear search">
            ✕
          </button>
        )}
      </div>

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

      {/* ── Status row ── */}
      <div className="ec-status-row">
        {userCoords ? (
          <div className="ec-nearby-badge">
            <span className="ec-nearby-dot" />
            Within 10 mi
          </div>
        ) : null}
        <div className="ec-count">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          {activeFilterCount > 0 || textQuery.trim() ? ' matching' : userCoords ? ' nearby' : ' upcoming'}
        </div>
        {hasAnyFilter && (
          <button className="ec-clear-all" onClick={clearAll}>Clear</button>
        )}
      </div>

      <div className="Event_List">
        {loading && filteredEvents.length === 0 && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <EventSkeleton key={i} />
            ))}
          </>
        )}
        {!loading && filteredEvents.length === 0 && (
          <div className="ec-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <p>
              {hasAnyFilter
                ? 'No events match your search.'
                : userCoords
                  ? 'No events found nearby.'
                  : 'No upcoming events.'}
            </p>
            {hasAnyFilter && (
              <button className="ec-clear-filter-btn" onClick={clearAll}>
                Clear filters
              </button>
            )}
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
