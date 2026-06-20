import { useState, useMemo, useEffect } from 'react';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import EventComponent from '../../Components/EventComponent/EventComponent.jsx';
import SearchBar from '../../Components/SearchBar/SearchBar.jsx';
import { useUpcomingEvents } from '../../Hooks/UseEvents.jsx';
import { useAuth } from '../../Hooks/UseAuth';
import './Explore.css';

const attendeeCount = (e) => e.attendees?.length || 0;

export default function ExplorePage() {
  const { events, loading, error } = useUpcomingEvents();
  const { user, isAuthenticated } = useAuth();

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('soonest');
  const [myInterests, setMyInterests] = useState([]);

  // Pull the signed-in user's interests to power the "For you" ranking.
  useEffect(() => {
    if (!isAuthenticated || !user?.token) {
      setMyInterests([]);
      return;
    }
    let active = true;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.success && Array.isArray(json.data?.interests)) {
          setMyInterests(json.data.interests);
          setSort('foryou');
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.token]);

  const overlap = (eventInterests) =>
    eventInterests.filter((i) => myInterests.includes(i)).length;

  const filtered = useMemo(() => {
    let list = [...events];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.eventName.toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q)
      );
    }
    if (selectedInterests.length) {
      list = list.filter((e) =>
        e.interests.some((i) => selectedInterests.includes(i))
      );
    }
    if (dateRange.startDate) {
      const s = new Date(dateRange.startDate);
      list = list.filter((e) => new Date(e.eventStart) >= s);
    }
    if (dateRange.endDate) {
      const en = new Date(dateRange.endDate);
      en.setHours(23, 59, 59, 999);
      list = list.filter((e) => new Date(e.eventStart) <= en);
    }

    list.sort((a, b) => {
      if (sort === 'popular') return attendeeCount(b) - attendeeCount(a);
      if (sort === 'foryou' && myInterests.length) {
        const diff = overlap(b.interests) - overlap(a.interests);
        if (diff !== 0) return diff;
      }
      return new Date(a.eventStart) - new Date(b.eventStart); // soonest
    });

    return list;
  }, [events, query, selectedInterests, dateRange, sort, myInterests]);

  return (
    <div className="explore-page">
      <Navbar page="/explore" />

      <header className="explore-hero">
        <h1>Explore events</h1>
        <p>
          Browse what’s happening around Cal Poly. Filter by interest, date, or
          keyword{isAuthenticated ? ' — sorted for you.' : '.'}
        </p>
      </header>

      <div className="explore-body">
        <aside className="explore-filters">
          <SearchBar
            onSelectionChange={setSelectedInterests}
            onDateChange={setDateRange}
          />
        </aside>

        <main className="explore-results">
          <div className="explore-toolbar">
            <input
              type="search"
              className="explore-search"
              placeholder="Search events by name or description…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search events"
            />
            <label className="explore-sort">
              Sort:
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {isAuthenticated && myInterests.length > 0 && (
                  <option value="foryou">For you</option>
                )}
                <option value="soonest">Soonest</option>
                <option value="popular">Most popular</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="explore-grid" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="explore-skeleton" />
              ))}
            </div>
          ) : error ? (
            <p className="explore-empty">
              Couldn’t load events right now — please try again later.
            </p>
          ) : filtered.length === 0 ? (
            <p className="explore-empty">
              No events match your filters. Try clearing some filters.
            </p>
          ) : (
            <>
              <p className="explore-count">
                {filtered.length} event{filtered.length === 1 ? '' : 's'}
              </p>
              <div className="explore-grid">
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}
