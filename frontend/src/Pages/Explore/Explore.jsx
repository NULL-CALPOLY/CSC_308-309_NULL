import { useState, useMemo, useEffect } from 'react';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import EventComponent from '../../Components/EventComponent/EventComponent.jsx';
import SearchBar from '../../Components/SearchBar/SearchBar.jsx';
import { useUpcomingEvents, useNearbyEvents } from '../../Hooks/UseEvents.jsx';
import { useAuth } from '../../Hooks/UseAuth';
import './Explore.css';

const attendeeCount = (e) => e.attendees?.length || 0;

export default function ExplorePage() {
  const { user, isAuthenticated } = useAuth();

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('soonest');
  const [myInterests, setMyInterests] = useState([]);
  const [nearMe, setNearMe] = useState(false);
  const [radiusKm, setRadiusKm] = useState(16);
  const [userCoords, setUserCoords] = useState(null);
  const [geoError, setGeoError] = useState('');

  // Location-bounded feed when "Near me" is on and we have coordinates;
  // otherwise the full upcoming feed.
  const usingNearby = nearMe && !!userCoords;
  const upcoming = useUpcomingEvents();
  const nearby = useNearbyEvents(
    usingNearby ? userCoords : null,
    radiusKm * 1000
  );
  const events = usingNearby ? nearby.events : upcoming.events;
  const loading = usingNearby ? nearby.loading : upcoming.loading;
  const error = usingNearby ? nearby.error : upcoming.error;

  // Pull the signed-in user's interests (for "For you") and saved location.
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
        if (!active || !json?.success) return;
        if (Array.isArray(json.data?.interests)) {
          setMyInterests(json.data.interests);
          setSort('foryou');
        }
        const coords = json.data?.location?.coordinates;
        if (Array.isArray(coords) && coords.length === 2) {
          const [lng, lat] = coords;
          if (lat != null && lng != null) setUserCoords({ lat, lng });
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.token]);

  // Toggle "Near me": use the saved location, else ask the browser.
  const toggleNearMe = () => {
    setGeoError('');
    if (nearMe) {
      setNearMe(false);
      return;
    }
    if (userCoords) {
      setNearMe(true);
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setNearMe(true);
        },
        () => setGeoError('Couldn’t get your location.')
      );
    } else {
      setGeoError('Location isn’t available in this browser.');
    }
  };

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
            <button
              type="button"
              className={`explore-nearme ${nearMe ? 'is-active' : ''}`}
              onClick={toggleNearMe}
              aria-pressed={nearMe}
              aria-label={nearMe ? 'Turn off near me filter' : 'Filter by events near me'}>
              📍 Near me
            </button>
            {usingNearby && (
              <label className="explore-sort">
                Within:
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}>
                  <option value={5}>5 km</option>
                  <option value={16}>16 km</option>
                  <option value={40}>40 km</option>
                  <option value={100}>100 km</option>
                </select>
              </label>
            )}
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
          {geoError && <p className="explore-geo-error">{geoError}</p>}

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
            <div className="explore-empty">
              <p>No events match your filters.</p>
              {(query || selectedInterests.length || dateRange.startDate || dateRange.endDate) && (
                <button
                  className="explore-clear-btn"
                  onClick={() => {
                    setQuery('');
                    setSelectedInterests([]);
                    setDateRange({ startDate: '', endDate: '' });
                  }}>
                  Clear all filters
                </button>
              )}
            </div>
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
