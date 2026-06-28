// EventColumn.jsx
import EventComponent from '../EventComponent/EventComponent.jsx';
import { useEffect, useState, useRef } from 'react';
import { useUpcomingEvents, useNearbyEvents } from '../../Hooks/UseEvents.jsx';
import SearchBar from '../SearchBar/SearchBar.jsx';

const NEARBY_RADIUS = 16093;

function EventSkeleton() {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-[14px] px-[18px] py-4 flex flex-col gap-2.5 animate-[ec-pulse_1.6s_ease-in-out_infinite]">
      <div className="h-[14px] w-[70%] rounded bg-[rgba(255,255,255,0.08)]" />
      <div className="h-[11px] w-[55%] rounded bg-[rgba(255,255,255,0.05)]" />
      <div className="h-[11px] w-[40%] rounded bg-[rgba(255,255,255,0.05)]" />
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
  const listRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (onRefetchReady) onRefetchReady(refetch);
  }, [refetch, onRefetchReady]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handleScroll = () => {
      const current = el.scrollTop;
      if (current < lastScrollY.current - 30 && filtersOpen) {
        setFiltersOpen(false);
      }
      lastScrollY.current = current;
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [filtersOpen]);

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
    <div className="absolute top-[var(--nav-h)] left-0 h-[calc(100vh-var(--nav-h))] w-[380px] flex flex-col bg-[rgba(8,8,14,0.88)] backdrop-blur-[20px] border-r border-[rgba(255,255,255,0.07)] shadow-[4px_0_32px_rgba(0,0,0,0.4)] px-6 pt-5 pb-0 overflow-hidden box-border z-10 max-md:top-0 max-md:h-full max-md:pt-8 max-md:border-r-0 max-md:border-t max-md:border-[rgba(255,255,255,0.07)] max-md:before:content-[''] max-md:before:block max-md:before:w-10 max-md:before:h-1 max-md:before:bg-[rgba(255,255,255,0.15)] max-md:before:rounded-sm max-md:before:mx-auto max-md:before:mb-3">
      {/* ── Text search ── */}
      <div className="relative flex items-center mb-1.5">
        <svg
          className="absolute left-[10px] text-[rgba(248,250,252,0.3)] pointer-events-none flex-shrink-0"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none">
          <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          className="w-full box-border py-[9px] pr-[34px] pl-[30px] rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#f8fafc] text-[0.85rem] outline-none transition-[border-color,box-shadow,background] duration-200 placeholder:text-[rgba(248,250,252,0.28)] focus:border-[rgba(124,58,237,0.5)] focus:bg-[rgba(255,255,255,0.06)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] [&::-webkit-search-cancel-button]:hidden"
          type="search"
          placeholder="Search events…"
          value={textQuery}
          onChange={(e) => setTextQuery(e.target.value)}
          aria-label="Search events"
        />
        {textQuery && (
          <button
            className="absolute right-2 bg-none border-none py-0.5 px-[5px] text-[rgba(248,250,252,0.4)] text-[0.75rem] cursor-pointer rounded leading-none transition-colors duration-150 hover:text-[#f8fafc]"
            onClick={() => setTextQuery('')}
            aria-label="Clear search">
            ✕
          </button>
        )}
      </div>

      {/* ── Collapsible filter toggle ── */}
      <button
        className="flex items-center gap-1.5 w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2 px-3 text-[rgba(248,250,252,0.65)] text-[0.82rem] font-semibold cursor-pointer text-left transition-[background,border-color] duration-200 mb-1.5 hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(124,58,237,0.3)] hover:text-[#f8fafc]"
        onClick={() => setFiltersOpen((v) => !v)}
        aria-expanded={filtersOpen}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <line x1="4" y1="18" x2="10" y2="18" />
        </svg>
        Filters
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full bg-[#7c3aed] text-white text-[0.68rem] font-bold">
            {activeFilterCount}
          </span>
        )}
        <svg
          className={`ml-auto text-[rgba(248,250,252,0.4)] transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {filtersOpen && (
        <div className="mb-[5px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[14px] py-2.5 px-3 shadow-[0_2px_12px_rgba(0,0,0,0.2)] max-h-[320px] overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:rgba(124,58,237,0.3)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[rgba(124,58,237,0.3)] [&::-webkit-scrollbar-thumb]:rounded-[10px] flex-shrink-0 max-md:rounded-[10px]">
          <SearchBar
            onSelectionChange={setSelectedInterests}
            onDateChange={setDateRange}
          />
        </div>
      )}

      {/* ── Status row ── */}
      <div className="flex items-center gap-2 py-0.5 pb-1.5 min-h-[24px]">
        {userCoords ? (
          <div className="flex items-center gap-[5px] text-[0.7rem] font-semibold text-[#a78bfa] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] flex-shrink-0 shadow-[0_0_6px_rgba(167,139,250,0.6)]" />
            Within 10 mi
          </div>
        ) : null}
        <div className="text-[0.72rem] font-semibold text-[rgba(248,250,252,0.35)] uppercase tracking-[0.05em] flex-1">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          {activeFilterCount > 0 || textQuery.trim() ? ' matching' : userCoords ? ' nearby' : ' upcoming'}
        </div>
        {hasAnyFilter && (
          <button
            className="bg-none border-none p-0 text-[0.72rem] font-semibold text-[rgba(167,139,250,0.7)] cursor-pointer whitespace-nowrap transition-colors duration-150 hover:text-[#a78bfa] hover:underline"
            onClick={clearAll}>
            Clear
          </button>
        )}
      </div>

      <div
        className="pt-2.5 pr-px w-full flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable_both-edges] flex flex-col gap-3 pb-[27px] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:bg-[rgba(124,58,237,0.25)] [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-track]:bg-transparent"
        ref={listRef}>
        {loading && filteredEvents.length === 0 && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <EventSkeleton key={i} />
            ))}
          </>
        )}
        {!loading && filteredEvents.length === 0 && (
          <div className="flex flex-col items-center gap-2.5 py-10 px-4 text-center text-[rgba(248,250,252,0.35)] text-[0.85rem]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <p className="m-0 leading-snug">
              {hasAnyFilter
                ? 'No events match your search.'
                : userCoords
                  ? 'No events found nearby.'
                  : 'No upcoming events.'}
            </p>
            {hasAnyFilter && (
              <button
                className="mt-1 py-1.5 px-3.5 rounded-[8px] border border-[rgba(124,58,237,0.35)] bg-[rgba(124,58,237,0.08)] text-[#a78bfa] text-[0.78rem] font-semibold cursor-pointer transition-[background,border-color] duration-200 hover:bg-[rgba(124,58,237,0.18)] hover:border-[rgba(124,58,237,0.55)]"
                onClick={clearAll}>
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
