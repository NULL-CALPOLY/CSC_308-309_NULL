import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function AddressSearchBar({
  onSelect,
  placeholder = 'Search for an address…',
  label,
  error,
  initialValue = '',
  className = '',
}) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedCoords, setSelectedCoords] = useState(null);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    if (controllerRef.current) controllerRef.current.abort();
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      controllerRef.current = new AbortController();
      setLoading(true);

      try {
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          addressdetails: '1',
          limit: '5',
        });

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            headers: { 'User-Agent': 'FindrApp/1.0' },
            signal: controllerRef.current.signal,
          }
        );

        const data = await res.json();
        setResults(data);
        setOpen(data.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Geocoding error:', err);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = useCallback(
    (item) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);

      setQuery(item.display_name);
      setSelectedCoords({ lat, lng });
      setOpen(false);
      setResults([]);

      onSelect?.({ address: item.display_name, lat, lng });
    },
    [onSelect]
  );

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    setSelectedCoords(null);
  };

  const formatPrimary = (item) => {
    const a = item.address || {};
    return (
      a.amenity ||
      a.building ||
      a.road ||
      a.pedestrian ||
      a.suburb ||
      a.neighbourhood ||
      item.display_name.split(',')[0]
    );
  };

  const formatSecondary = (item) => {
    const a = item.address || {};
    const parts = [
      a.house_number ? `${a.house_number} ${a.road || ''}`.trim() : a.road,
      a.city || a.town || a.village || a.county,
      a.state,
      a.country,
    ].filter(Boolean);
    return parts.slice(0, 3).join(', ');
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox">
      {label && (
        <label className="block text-[0.82rem] font-semibold text-[rgba(248,250,252,0.72)] mb-1.5">
          {label}
        </label>
      )}

      <div
        className={`relative flex items-center border rounded-[10px] bg-[rgba(255,255,255,0.05)] transition-[border-color,box-shadow] duration-200 focus-within:border-[rgba(124,58,237,0.55)] focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] ${
          error
            ? 'border-[rgba(239,68,68,0.6)] focus-within:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
            : 'border-[rgba(255,255,255,0.1)]'
        }`}>
        <svg
          className="w-4 h-4 text-[#a78bfa] ml-3 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          className="flex-1 border-none outline-none bg-transparent px-2 py-2.5 text-[0.875rem] text-[#f8fafc] min-w-0 placeholder:text-[rgba(248,250,252,0.3)]"
          value={query}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="asb-listbox"
          aria-activedescendant={
            activeIndex >= 0 ? `asb-option-${activeIndex}` : undefined
          }
        />

        <div className="w-8 flex items-center justify-center flex-shrink-0">
          {loading ? (
            <span
              className="inline-block w-3.5 h-3.5 border-2 border-[rgba(124,58,237,0.25)] border-t-[#7c3aed] rounded-full animate-spin-slow"
              aria-label="Searching…"
            />
          ) : query.length > 0 ? (
            <button
              type="button"
              className="bg-transparent border-none cursor-pointer text-[rgba(248,250,252,0.4)] text-xs px-1 py-0.5 rounded transition-colors duration-150 hover:text-[rgba(248,250,252,0.8)] hover:bg-[rgba(255,255,255,0.06)]"
              onClick={() => {
                setQuery('');
                setSelectedCoords(null);
                setResults([]);
                setOpen(false);
                inputRef.current?.focus();
              }}
              aria-label="Clear address">
              ✕
            </button>
          ) : null}
        </div>
      </div>

      {selectedCoords && (
        <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.3)] rounded-full text-[0.72rem] text-[#a78bfa] tabular-nums">
          <svg
            className="w-[11px] h-[11px] flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>
            {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
          </span>
        </div>
      )}

      {error && <p className="mt-1 text-[0.78rem] text-[#f87171]">{error}</p>}

      {open && results.length > 0 && (
        <ul
          id="asb-listbox"
          role="listbox"
          className="absolute top-[calc(100%+4px)] left-0 right-0 bg-[#1a1a27] border border-[rgba(124,58,237,0.2)] rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_10px_24px_-4px_rgba(0,0,0,0.4)] z-[9999] list-none m-0 py-1 overflow-hidden"
          aria-label="Address suggestions">
          {results.map((item, idx) => (
            <li
              key={item.place_id}
              id={`asb-option-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              className={`flex items-start gap-2.5 px-3.5 py-2.5 cursor-pointer transition-colors duration-[120ms] ${
                idx === activeIndex
                  ? 'bg-[rgba(124,58,237,0.1)]'
                  : 'hover:bg-[rgba(124,58,237,0.1)]'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              onMouseEnter={() => setActiveIndex(idx)}>
              <svg
                className="w-4 h-4 text-[#a78bfa] flex-shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div className="flex flex-col min-w-0">
                <span className="text-[0.875rem] font-semibold text-[#f8fafc] truncate">
                  {formatPrimary(item)}
                </span>
                <span className="text-[0.78rem] text-[rgba(248,250,252,0.5)] truncate mt-0.5">
                  {formatSecondary(item)}
                </span>
              </div>
            </li>
          ))}
          <li
            className="px-3.5 py-1.5 text-[0.68rem] text-[rgba(248,250,252,0.25)] text-right border-t border-[rgba(255,255,255,0.06)] select-none"
            aria-hidden="true">
            Powered by OpenStreetMap / Nominatim
          </li>
        </ul>
      )}
    </div>
  );
}
