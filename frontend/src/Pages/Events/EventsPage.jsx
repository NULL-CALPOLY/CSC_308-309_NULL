import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import { useDocumentTitle } from '../../Hooks/UseDocumentTitle.js';
import EventComponent from '../../Components/EventComponent/EventComponent.jsx';
import { useUpcomingEvents } from '../../Hooks/UseEvents.jsx';
import useInterests from '../../Hooks/UseInterests.jsx';
import { useAuth } from '../../Hooks/UseAuth.ts';

const SORT_OPTIONS = [
  { value: 'foryou', label: 'For You', authOnly: true },
  { value: 'soonest', label: 'Soonest' },
  { value: 'popular', label: 'Most Popular' },
];

const dateCls = 'w-full box-border bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[8px] text-[#f8fafc] py-2 px-3 text-[max(16px,0.88rem)] cursor-pointer [color-scheme:dark] outline-none transition-[border-color,box-shadow] duration-150 [&::-webkit-calendar-picker-indicator]:[filter:invert(0.55)_sepia(1)_hue-rotate(230deg)_saturate(2)] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 focus:border-[rgba(124,58,237,0.5)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] dark:bg-[rgba(0,0,0,0.05)] dark:border-[rgba(0,0,0,0.15)] dark:text-[#1a1a2e] dark:[color-scheme:light] dark:[&::-webkit-calendar-picker-indicator]:[filter:none]';

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
      list = list.filter((e) => e.interests.some((i) => selectedInterests.includes(i)));
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

  const hasFilters = query || selectedInterests.length || dateFrom || dateTo;

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

  const filterBadgeCount = selectedInterests.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#0d0d14] text-[#f8fafc] dark:bg-[#f5f5f7] dark:text-[#1a1a2e]">
      <Navbar page="/events" />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#13101f] to-[#0d0d14] border-b border-[rgba(124,58,237,0.15)] px-6 pt-[calc(var(--nav-h,80px)+2.5rem)] pb-10 max-[600px]:pt-[calc(var(--nav-h,80px)+1.5rem)] max-[600px]:pb-7 max-[600px]:px-5 dark:from-[#ede9f8] dark:to-[#f5f5f7] dark:border-[rgba(124,58,237,0.2)]">
        <div className="max-w-[860px] mx-auto">
          <h1 className="m-0 mb-2 text-[clamp(2rem,4vw,3rem)] font-extrabold text-[#f8fafc] tracking-[-0.02em] leading-[1.15] max-[600px]:text-[1.8rem] dark:text-[#1a1a2e]">
            Events
          </h1>
          <p className="m-0 mb-7 text-[rgba(248,250,252,0.8)] text-[1.05rem] leading-relaxed max-w-[560px] max-[600px]:text-[0.95rem] dark:text-[rgba(26,26,46,0.7)]">
            {isAuthenticated && myInterests.length > 0
              ? 'Personalized picks for you, plus everything happening at Cal Poly.'
              : 'Browse everything happening at Cal Poly. Sign in to get personalized recommendations.'}
          </p>
          <div className="relative flex items-center bg-[rgba(255,255,255,0.06)] border-[1.5px] border-[rgba(255,255,255,0.12)] rounded-[12px] px-4 max-w-[620px] transition-[border-color,box-shadow] duration-200 focus-within:border-[rgba(124,58,237,0.6)] focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] dark:bg-white dark:border-[rgba(0,0,0,0.15)]">
            <svg className="text-[rgba(248,250,252,0.4)] flex-shrink-0 dark:text-[rgba(26,26,46,0.4)]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="flex-1 bg-none border-none outline-none text-[#f8fafc] text-base py-[0.85rem] px-3 placeholder:text-[rgba(248,250,252,0.35)] dark:text-[#1a1a2e] dark:placeholder:text-[rgba(26,26,46,0.35)]"
              type="search"
              placeholder="Search events by name, description, or location…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search events"
            />
            {query && (
              <button
                className="bg-none border-none text-[rgba(248,250,252,0.45)] text-[1.3rem] cursor-pointer p-1 leading-none rounded flex-shrink-0 transition-colors duration-150 hover:text-[#f8fafc] dark:text-[rgba(26,26,46,0.4)] dark:hover:text-[#1a1a2e]"
                onClick={() => setQuery('')}
                aria-label="Clear search">
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-[1240px] mx-auto px-6 pt-8 pb-20 grid grid-cols-[260px_1fr] gap-x-8 items-start max-[900px]:grid-cols-1 max-[900px]:px-5 max-[900px]:pt-6 max-[900px]:pb-16">

        {/* Mobile filter toggle — hidden on desktop */}
        <button
          className="hidden max-[900px]:flex items-center gap-2 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[#f8fafc] py-[0.6rem] px-4 rounded-[8px] text-[0.9rem] font-semibold cursor-pointer w-fit mb-4 col-[1/-1] dark:bg-[rgba(0,0,0,0.04)] dark:border-[rgba(0,0,0,0.15)] dark:text-[#1a1a2e]"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-expanded={sidebarOpen}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="14" y2="12" />
            <line x1="4" y1="18" x2="10" y2="18" />
          </svg>
          Filters
          {filterBadgeCount > 0 && (
            <span className="bg-[#7c3aed] text-white rounded-full text-[0.72rem] font-bold py-[0.05rem] px-[0.45rem] min-w-[1.3em] text-center">
              {filterBadgeCount}
            </span>
          )}
        </button>

        {/* Sidebar */}
        <aside className={`col-[1] sticky top-[calc(var(--nav-h,80px)+1.5rem)] flex flex-col gap-0 max-[900px]:static max-[900px]:col-[1] max-[900px]:bg-[rgba(255,255,255,0.03)] max-[900px]:border max-[900px]:border-[rgba(255,255,255,0.07)] max-[900px]:rounded-[12px] max-[900px]:p-5 max-[900px]:mb-6 dark:max-[900px]:bg-white dark:max-[900px]:border-[rgba(0,0,0,0.1)] ${sidebarOpen ? 'max-[900px]:flex' : 'max-[900px]:hidden'}`}>
          <div className="py-5 border-b border-[rgba(255,255,255,0.07)] first:pt-0 dark:border-[rgba(0,0,0,0.08)]">
            <h3 className="m-0 mb-[0.85rem] text-[0.8rem] font-bold text-[rgba(248,250,252,0.72)] uppercase tracking-[0.08em] flex items-center justify-between dark:text-[#64748b]">Sort by</h3>
            <div className="flex flex-col gap-[0.35rem]">
              {availableSorts.map((o) => (
                <button
                  key={o.value}
                  className={`bg-none border rounded-[8px] py-2 px-[0.85rem] text-[0.88rem] font-medium text-left cursor-pointer transition-[background,color,border-color] duration-150 ${
                    sort === o.value
                      ? 'bg-[rgba(124,58,237,0.15)] border-[rgba(124,58,237,0.4)] text-[#a78bfa] font-semibold'
                      : 'border-[rgba(255,255,255,0.12)] text-[rgba(248,250,252,0.82)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f8fafc] dark:border-[rgba(0,0,0,0.15)] dark:text-[rgba(26,26,46,0.75)] dark:hover:bg-[rgba(0,0,0,0.04)] dark:hover:text-[#1a1a2e]'
                  }`}
                  onClick={() => setSort(o.value)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="py-5 border-b border-[rgba(255,255,255,0.07)] dark:border-[rgba(0,0,0,0.08)]">
            <h3 className="m-0 mb-[0.85rem] text-[0.8rem] font-bold text-[rgba(248,250,252,0.72)] uppercase tracking-[0.08em] dark:text-[#64748b]">Date range</h3>
            <label className="flex flex-col gap-[0.3rem] text-[0.82rem] text-[rgba(248,250,252,0.5)] mb-[0.6rem] dark:text-[rgba(26,26,46,0.5)]">
              From
              <input type="date" className={dateCls} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </label>
            <label className="flex flex-col gap-[0.3rem] text-[0.82rem] text-[rgba(248,250,252,0.5)] mb-[0.6rem] dark:text-[rgba(26,26,46,0.5)]">
              To
              <input type="date" className={dateCls} value={dateTo} min={dateFrom} onChange={(e) => setDateTo(e.target.value)} />
            </label>
            {(dateFrom || dateTo) && (
              <button
                className="bg-none border-none text-[#a78bfa] text-[0.82rem] cursor-pointer p-0 underline underline-offset-2"
                onClick={() => { setDateFrom(''); setDateTo(''); }}>
                Clear dates
              </button>
            )}
          </div>

          {allInterests.length > 0 && (
            <div className="py-5 border-b-0">
              <h3 className="m-0 mb-[0.85rem] text-[0.8rem] font-bold text-[rgba(248,250,252,0.72)] uppercase tracking-[0.08em] flex items-center justify-between dark:text-[#64748b]">
                Interests
                {selectedInterests.length > 0 && (
                  <button className="bg-none border-none text-[#a78bfa] text-[0.75rem] cursor-pointer p-0 font-medium normal-case tracking-normal" onClick={() => setSelectedInterests([])}>Clear</button>
                )}
              </h3>
              <div className="flex flex-wrap gap-[0.4rem]">
                {allInterests.map((interest) => {
                  const name = interest.name || interest;
                  const active = selectedInterests.includes(name);
                  return (
                    <button
                      key={name}
                      className={`bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[rgba(248,250,252,0.7)] rounded-full py-[0.3rem] px-[0.7rem] text-[0.78rem] font-medium cursor-pointer flex items-center gap-[0.3rem] transition-[background,border-color,color] duration-150 hover:bg-[rgba(124,58,237,0.12)] hover:border-[rgba(124,58,237,0.3)] hover:text-[#f8fafc] dark:bg-[rgba(0,0,0,0.04)] dark:border-[rgba(0,0,0,0.15)] dark:text-[rgba(26,26,46,0.7)] dark:hover:bg-[rgba(124,58,237,0.08)] dark:hover:border-[rgba(124,58,237,0.3)] dark:hover:text-[#1a1a2e] ${active ? '!bg-[rgba(124,58,237,0.2)] !border-[rgba(124,58,237,0.5)] !text-[#a78bfa] font-semibold' : ''}`}
                      onClick={() => toggleInterest(name)}>
                      {active && <span className="text-[0.7rem] text-[#7c3aed]">✓</span>}
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="min-w-0">
          {/* Recommended section */}
          {recommended.length > 0 && !hasFilters && sort === 'foryou' && (
            <section className="mb-12">
              <div className="mb-5">
                <span className="inline-flex items-center gap-[0.4rem] bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.3)] text-[#a78bfa] rounded-full text-[0.75rem] font-bold py-1 px-[0.65rem] tracking-[0.04em] uppercase mb-[0.6rem]">✦ For You</span>
                <h2 className="m-0 mb-[0.3rem] text-[1.4rem] font-bold text-[#f8fafc] dark:text-[#1a1a2e]">Recommended</h2>
                <p className="m-0 text-[rgba(248,250,252,0.5)] text-[0.88rem] dark:text-[rgba(26,26,46,0.5)]">Based on your interests: {myInterests.slice(0, 3).join(', ')}{myInterests.length > 3 ? ` +${myInterests.length - 3} more` : ''}</p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 items-start max-[600px]:grid-cols-1 max-[600px]:gap-4">
                {recommended.map((event) => (
                  <EventComponent key={event.id} eventId={event.id} eventName={event.eventName} eventDate={event.eventDate} eventTime={event.eventTime} eventAddress={event.eventAddress} description={event.description} attendees={event.attendees} host={event.host} interest={event.interests.join(', ')} />
                ))}
              </div>
            </section>
          )}

          {/* All events */}
          <section>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="text-[0.88rem] text-[rgba(248,250,252,0.72)] dark:text-[#64748b]">
                {loading ? <span>Loading events…</span> : <span>{filtered.length} event{filtered.length !== 1 ? 's' : ''}{hasFilters ? ' matching filters' : ''}</span>}
              </div>
              {hasFilters && (
                <button className="bg-none border border-[rgba(255,255,255,0.1)] text-[rgba(248,250,252,0.6)] rounded-[6px] py-[0.35rem] px-3 text-[0.82rem] cursor-pointer transition-all duration-150 hover:border-[rgba(255,255,255,0.25)] hover:text-[#f8fafc] dark:border-[rgba(0,0,0,0.15)] dark:text-[rgba(26,26,46,0.55)] dark:hover:border-[rgba(0,0,0,0.3)] dark:hover:text-[#1a1a2e]" onClick={clearFilters}>Clear all filters</button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 items-start max-[600px]:grid-cols-1 max-[600px]:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[240px] rounded-[14px] animate-shimmer" style={{background:'linear-gradient(100deg,rgba(255,255,255,0.03) 30%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.03) 70%)',backgroundSize:'200% 100%'}} />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center text-[rgba(248,250,252,0.4)] dark:text-[rgba(26,26,46,0.4)]">
                <p className="m-0">Couldn't load events — please try again later.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16 px-8 text-center text-[rgba(248,250,252,0.4)] dark:text-[rgba(26,26,46,0.4)]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <p className="m-0 text-base">No events match your filters.</p>
                {hasFilters && (
                  <button className="bg-[#7c3aed] border-none text-white rounded-[8px] py-[0.6rem] px-5 text-[0.9rem] font-semibold cursor-pointer transition-[background] duration-200 hover:bg-[#6d28d9]" onClick={clearFilters}>Clear filters</button>
                )}
                {!isAuthenticated && (
                  <button className="bg-transparent border border-[rgba(255,255,255,0.15)] text-[rgba(248,250,252,0.7)] rounded-[8px] py-[0.6rem] px-5 text-[0.9rem] font-semibold cursor-pointer transition-[background,color] duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f8fafc] dark:border-[rgba(0,0,0,0.15)] dark:text-[rgba(26,26,46,0.7)] dark:hover:bg-[rgba(0,0,0,0.04)] dark:hover:text-[#1a1a2e]" onClick={() => navigate('/home')}>Browse map</button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 items-start max-[600px]:grid-cols-1 max-[600px]:gap-4">
                {filtered.map((event) => (
                  <EventComponent key={event.id} eventId={event.id} eventName={event.eventName} eventDate={event.eventDate} eventTime={event.eventTime} eventAddress={event.eventAddress} description={event.description} attendees={event.attendees} host={event.host} interest={event.interests.join(', ')} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
