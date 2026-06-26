import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import { useDocumentTitle } from '../../Hooks/UseDocumentTitle.js';
import EventComponent from '../../Components/EventComponent/EventComponent.jsx';
import { useUpcomingEvents } from '../../Hooks/UseEvents.jsx';
import useInterests from '../../Hooks/UseInterests.jsx';
import { useAuth } from '../../Hooks/UseAuth.ts';
import './EventsPage.css';

const SORT_OPTIONS = [
  { value: 'foryou', label: 'For You', authOnly: true },
  { value: 'soonest', label: 'Soonest' },
  { value: 'popular', label: 'Most Popular' },
];

export default function EventsPage() {
  useDocumentTitle('Events');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { events: allEvents, loading, error } = useUpcomingEvents();
  const { interests: allInterests } = useInterests();

  const [query, setQuery] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('soonest');
  const [myInterests, setMyInterests] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.token) {
      setMyInterests([]);
      setSort('soonest');
      return;
    }
    fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json?.success) return;
        const interests = json.data?.interests ?? [];
        if (Array.isArray(interests) && interests.length > 0) {
          setMyInterests(interests.map((i) => (typeof i === 'object' ? i.name : i)));
          setSort('foryou');
        }
      })
      .catch(() => {});
  }, [isAuthenticated, user?.token]);

  const overlapScore = (eventInterests) =>
    eventInterests.filter((i) => myInterests.includes(i)).length;

  const filtered = useMemo(() => {
    let list = [...allEvents];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.eventName.toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q) ||
          (e.eventAddress || '').toLowerCase().includes(q)
      );
    }
    if (selectedInterests.length) {
      list = list.filter((e) =>
        e.interests.some((i) => selectedInterests.includes(i))
      );
    }
    if (dateFrom) {
      const s = new Date(dateFrom);
      list = list.filter((e) => new Date(e.eventStart) >= s);
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      list = list.filter((e) => new Date(e.eventStart) <= end);
    }

    list.sort((a, b) => {
      if (sort === 'popular') return (b.attendees?.length || 0) - (a.attendees?.length || 0);
      if (sort === 'foryou' && myInterests.length) {
        const diff = overlapScore(b.interests) - overlapScore(a.interests);
        if (diff !== 0) return diff;
      }
      return new Date(a.eventStart) - new Date(b.eventStart);
    });

    return list;
  }, [allEvents, query, selectedInterests, dateFrom, dateTo, sort, myInterests]);

  const recommended = useMemo(() => {
    if (!isAuthenticated || myInterests.length === 0) return [];
    return [...allEvents]
      .filter((e) => overlapScore(e.interests) > 0)
      .sort((a, b) => overlapScore(b.interests) - overlapScore(a.interests))
      .slice(0, 4);
  }, [allEvents, myInterests, isAuthenticated]);

  const hasFilters =
    query || selectedInterests.length || dateFrom || dateTo;

  const clearFilters = () => {
    setQuery('');
    setSelectedInterests([]);
    setDateFrom('');
    setDateTo('');
  };

  const toggleInterest = (name) => {
    setSelectedInterests((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const availableSorts = SORT_OPTIONS.filter(
    (o) => !o.authOnly || (isAuthenticated && myInterests.length > 0)
  );

  return (
    <div className="ep-page">
      <Navbar page="/events" />

      <div className="ep-hero">
        <div className="ep-hero-inner">
          <h1>Events</h1>
          <p>
            {isAuthenticated && myInterests.length > 0
              ? 'Personalized picks for you, plus everything happening at Cal Poly.'
              : 'Browse everything happening at Cal Poly. Sign in to get personalized recommendations.'}
          </p>
          <div className="ep-hero-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search events by name, description, or location…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search events"
            />
            {query && (
              <button className="ep-search-clear" onClick={() => setQuery('')} aria-label="Clear search">×</button>
            )}
          </div>
        </div>
      </div>

      <div className="ep-layout">
        {/* Mobile filter toggle */}
        <button
          className="ep-filter-toggle"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-expanded={sidebarOpen}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="14" y2="12" />
            <line x1="4" y1="18" x2="10" y2="18" />
          </svg>
          Filters
          {(selectedInterests.length > 0 || dateFrom || dateTo) && (
            <span className="ep-filter-badge">
              {selectedInterests.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Sidebar */}
        <aside className={`ep-sidebar${sidebarOpen ? ' ep-sidebar--open' : ''}`}>
          <div className="ep-sidebar-section">
            <h3>Sort by</h3>
            <div className="ep-sort-pills">
              {availableSorts.map((o) => (
                <button
                  key={o.value}
                  className={`ep-sort-pill${sort === o.value ? ' active' : ''}`}
                  onClick={() => setSort(o.value)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ep-sidebar-section">
            <h3>Date range</h3>
            <label className="ep-date-label">
              From
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </label>
            <label className="ep-date-label">
              To
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </label>
            {(dateFrom || dateTo) && (
              <button className="ep-clear-dates" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                Clear dates
              </button>
            )}
          </div>

          {allInterests.length > 0 && (
            <div className="ep-sidebar-section">
              <h3>
                Interests
                {selectedInterests.length > 0 && (
                  <button className="ep-clear-link" onClick={() => setSelectedInterests([])}>
                    Clear
                  </button>
                )}
              </h3>
              <div className="ep-interest-list">
                {allInterests.map((interest) => {
                  const name = interest.name || interest;
                  const active = selectedInterests.includes(name);
                  return (
                    <button
                      key={name}
                      className={`ep-interest-chip${active ? ' active' : ''}`}
                      onClick={() => toggleInterest(name)}>
                      {active && <span className="ep-chip-check">✓</span>}
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="ep-main">
          {/* Recommended section */}
          {recommended.length > 0 && !hasFilters && sort === 'foryou' && (
            <section className="ep-section">
              <div className="ep-section-header">
                <span className="ep-section-badge">✦ For You</span>
                <h2>Recommended</h2>
                <p>Based on your interests: {myInterests.slice(0, 3).join(', ')}{myInterests.length > 3 ? ` +${myInterests.length - 3} more` : ''}</p>
              </div>
              <div className="ep-grid ep-grid--featured">
                {recommended.map((event) => (
                  <EventComponent
                    key={event.id}
                    eventId={event.id}
                    eventName={event.eventName}
                    eventDate={event.eventDate}
                    eventTime={event.eventTime}
                    eventAddress={event.eventAddress}
                    description={event.description}
                    attendees={event.attendees}
                    host={event.host}
                    interest={event.interests.join(', ')}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All events section */}
          <section className="ep-section">
            <div className="ep-toolbar">
              <div className="ep-results-meta">
                {loading ? (
                  <span>Loading events…</span>
                ) : (
                  <span>
                    {filtered.length} event{filtered.length !== 1 ? 's' : ''}
                    {hasFilters ? ' matching filters' : ''}
                  </span>
                )}
              </div>
              {hasFilters && (
                <button className="ep-clear-all" onClick={clearFilters}>
                  Clear all filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="ep-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="ep-skeleton" />
                ))}
              </div>
            ) : error ? (
              <div className="ep-empty">
                <p>Couldn't load events — please try again later.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="ep-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <p>No events match your filters.</p>
                {hasFilters && (
                  <button className="ep-empty-action" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
                {!isAuthenticated && (
                  <button className="ep-empty-action ep-empty-action--secondary" onClick={() => navigate('/home')}>
                    Browse map
                  </button>
                )}
              </div>
            ) : (
              <div className="ep-grid">
                {filtered.map((event) => (
                  <EventComponent
                    key={event.id}
                    eventId={event.id}
                    eventName={event.eventName}
                    eventDate={event.eventDate}
                    eventTime={event.eventTime}
                    eventAddress={event.eventAddress}
                    description={event.description}
                    attendees={event.attendees}
                    host={event.host}
                    interest={event.interests.join(', ')}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
