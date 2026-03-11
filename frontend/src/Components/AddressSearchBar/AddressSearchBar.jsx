import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AddressSearchBar.css';

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
      className={`asb-root ${className}`}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox">
      {label && <label className="asb-label">{label}</label>}

      <div className={`asb-input-wrapper ${error ? 'asb-input--error' : ''}`}>
        <svg
          className="asb-icon-pin"
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
          className="asb-input"
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

        <div className="asb-icon-right">
          {loading ? (
            <span className="asb-spinner" aria-label="Searching…" />
          ) : query.length > 0 ? (
            <button
              type="button"
              className="asb-clear-btn"
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
        <div className="asb-coords-badge">
          <svg
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

      {error && <p className="asb-error">{error}</p>}

      {open && results.length > 0 && (
        <ul
          id="asb-listbox"
          role="listbox"
          className="asb-dropdown"
          aria-label="Address suggestions">
          {results.map((item, idx) => (
            <li
              key={item.place_id}
              id={`asb-option-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              className={`asb-option ${idx === activeIndex ? 'asb-option--active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              onMouseEnter={() => setActiveIndex(idx)}>
              <svg
                className="asb-option-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div className="asb-option-text">
                <span className="asb-option-primary">
                  {formatPrimary(item)}
                </span>
                <span className="asb-option-secondary">
                  {formatSecondary(item)}
                </span>
              </div>
            </li>
          ))}
          <li className="asb-powered-by" aria-hidden="true">
            Powered by OpenStreetMap / Nominatim
          </li>
        </ul>
      )}
    </div>
  );
}
