import { useState, useMemo, useEffect } from 'react';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import EventComponent from '../../Components/EventComponent/EventComponent.jsx';
import SearchBar from '../../Components/SearchBar/SearchBar.jsx';
import { useUpcomingEvents, useNearbyEvents } from '../../Hooks/UseEvents.jsx';
import { useAuth } from '../../Hooks/UseAuth';

const attendeeCount = (e) => e.attendees?.length || 0;

const selectCls = "py-2 border border-[rgba(255,255,255,0.1)] rounded-[8px] bg-[rgba(255,255,255,0.06)] text-[#f8fafc] text-[0.88rem] cursor-pointer appearance-none font-[inherit] transition-[border-color] duration-150 outline-none focus:border-[rgba(124,58,237,0.5)] focus:shadow-[0_0_0_2px_rgba(124,58,237,0.12)]";

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

  const usingNearby = nearMe && !!userCoords;
  const upcoming = useUpcomingEvents();
  const nearby = useNearbyEvents(
    usingNearby ? userCoords : null,
    radiusKm * 1000
  );
  const events = usingNearby ? nearby.events : upcoming.events;
  const loading = usingNearby ? nearby.loading : upcoming.loading;
  const error = usingNearby ? nearby.error : upcoming.error;

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
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setNearMe(true);
        },
        () => setGeoError("Couldn't get your location.")
      );
    } else {
      setGeoError("Location isn't available in this browser.");
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
      return new Date(a.eventStart) - new Date(b.eventStart);
    });

    return list;
  }, [events, query, selectedInterests, dateRange, sort, myInterests]);

  return (
    <div className="min-h-screen bg-[#0d0d14] text-[#f8fafc] pt-[var(--nav-h,80px)]">
      <Navbar page="/explore" />

      <div className="w-[min(1200px,92%)] mx-auto py-8 pb-4 border-b border-[rgba(255,255,255,0.07)]">
        <h1 className="text-[clamp(1.8rem,3.2vw,2.6rem)] m-0 mb-[0.4rem] text-[#f8fafc] font-extrabold tracking-[-0.02em]">
          Explore events
        </h1>
        <p className="text-[rgba(248,250,252,0.8)] m-0">
          Browse what's happening around Cal Poly. Filter by interest, date, or
          keyword{isAuthenticated ? ' — sorted for you.' : '.'}
        </p>
      </div>

      <div className="w-[min(1200px,92%)] mx-auto py-6 pb-16 grid grid-cols-[280px_1fr] gap-8 items-start max-[860px]:grid-cols-1">
        <aside className="sticky top-[calc(var(--nav-h,80px)+1rem)] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-5 max-[860px]:static">
          <SearchBar
            onSelectionChange={setSelectedInterests}
            onDateChange={setDateRange}
          />
        </aside>

        <main>
          <div className="flex gap-3 items-center flex-wrap mb-5 max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:gap-[0.6rem]">
            <input
              type="search"
              className="flex-[1_1_260px] py-[0.65rem] px-4 border border-[rgba(255,255,255,0.1)] rounded-[10px] text-[max(16px,0.95rem)] bg-[rgba(255,255,255,0.05)] text-[#f8fafc] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[rgba(248,250,252,0.35)] focus:border-[rgba(124,58,237,0.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] max-[600px]:flex-none max-[600px]:w-full max-[600px]:box-border max-[600px]:py-3 max-[600px]:text-base"
              placeholder="Search events by name or description…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search events"
            />
            <button
              type="button"
              className={`py-2 px-[0.9rem] border rounded-[8px] text-[0.88rem] cursor-pointer whitespace-nowrap transition-[background,border-color,color] duration-150 max-[600px]:w-full max-[600px]:box-border max-[600px]:py-[0.65rem] max-[600px]:px-4 max-[600px]:text-[0.95rem] max-[600px]:text-center ${
                nearMe
                  ? 'bg-[rgba(124,58,237,0.2)] border-[rgba(124,58,237,0.5)] text-[#a78bfa] font-semibold'
                  : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[rgba(248,250,252,0.75)] hover:border-[rgba(124,58,237,0.4)] hover:text-[#f8fafc]'
              }`}
              onClick={toggleNearMe}
              aria-pressed={nearMe}
              aria-label={nearMe ? 'Turn off near me filter' : 'Filter by events near me'}>
              📍 Near me
            </button>
            {usingNearby && (
              <label className="inline-flex items-center gap-2 text-[rgba(248,250,252,0.55)] text-[0.88rem] max-[600px]:w-full max-[600px]:box-border max-[600px]:justify-center">
                Within:
                <select
                  className={`${selectCls} pl-[0.7rem] pr-7 max-[600px]:flex-1`}
                  style={{backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(248,250,252,0.45)' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 0.6rem center'}}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}>
                  <option value={5} style={{background:'#1a1a27'}}>5 km</option>
                  <option value={16} style={{background:'#1a1a27'}}>16 km</option>
                  <option value={40} style={{background:'#1a1a27'}}>40 km</option>
                  <option value={100} style={{background:'#1a1a27'}}>100 km</option>
                </select>
              </label>
            )}
            <label className="inline-flex items-center gap-2 text-[rgba(248,250,252,0.55)] text-[0.88rem] max-[600px]:w-full max-[600px]:box-border max-[600px]:justify-center">
              Sort:
              <select
                className={`${selectCls} pl-[0.7rem] pr-7 max-[600px]:flex-1`}
                style={{backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(248,250,252,0.45)' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 0.6rem center'}}
                value={sort}
                onChange={(e) => setSort(e.target.value)}>
                {isAuthenticated && myInterests.length > 0 && (
                  <option value="foryou" style={{background:'#1a1a27'}}>For you</option>
                )}
                <option value="soonest" style={{background:'#1a1a27'}}>Soonest</option>
                <option value="popular" style={{background:'#1a1a27'}}>Most popular</option>
              </select>
            </label>
          </div>
          {geoError && <p className="text-[#f87171] text-[0.85rem] -mt-2 mb-4">{geoError}</p>}

          {loading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 max-[600px]:grid-cols-1 max-[600px]:gap-4" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[230px] rounded-[14px] animate-shimmer"
                  style={{
                    background: 'linear-gradient(100deg, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 70%)',
                    backgroundSize: '200% 100%',
                  }}
                />
              ))}
            </div>
          ) : error ? (
            <p className="text-[rgba(248,250,252,0.72)] py-12 text-center">
              Couldn't load events right now — please try again later.
            </p>
          ) : filtered.length === 0 ? (
            <div className="text-[rgba(248,250,252,0.72)] py-12 text-center flex flex-col items-center gap-4">
              <p className="m-0">No events match your filters.</p>
              {(query || selectedInterests.length || dateRange.startDate || dateRange.endDate) && (
                <button
                  className="bg-[#7c3aed] border-none text-white rounded-[8px] py-[0.6rem] px-5 text-[0.9rem] font-semibold cursor-pointer transition-[background] duration-200 hover:bg-[#6d28d9]"
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
              <p className="text-[rgba(248,250,252,0.72)] text-[0.88rem] m-0 mb-4">
                {filtered.length} event{filtered.length === 1 ? '' : 's'}
              </p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 items-start max-[600px]:grid-cols-1 max-[600px]:gap-4">
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
