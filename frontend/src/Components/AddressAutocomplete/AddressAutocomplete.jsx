import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AddressAutocomplete.css';


export default function AddressAutocomplete({
  onSelect,
  placeholder = 'Search for an address…',
  value: controlledValue,
  error,
}) {
  const [query, setQuery] = useState(controlledValue ?? '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selected, setSelected] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (controlledValue !== undefined) setQuery(controlledValue);
  }, [controlledValue]);


  useEffect(() => {
    if (selected) return;
    if (query.trim().length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          addressdetails: '1',
          limit: '6',
          countrycodes: 'us',
        });

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            headers: { 'User-Agent': 'FindrApp/1.0 (csc309@calpoly.edu)' },
            signal: abortRef.current.signal,
          }
        );

        const data = await res.json();
        setResults(data);
        setIsOpen(data.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[AddressAutocomplete] Fetch error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      if (abortRef.current) abortRef.current.abort();
      setIsLoading(false);
    };
  }, [query, selected]);

  const handleSelect = useCallback(
    (item) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      const address = item.display_name;

      setQuery(address);
      setResults([]);
      setIsOpen(false);
      setActiveIndex(-1);
      setSelected(true);

      onSelect?.({ address, lat, lng });
    },
    [onSelect]
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    setSelected(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const formatLabel = (item) => {
    const a = item.address;
    if (!a) return item.display_name;

    const parts = [
      a.house_number && a.road ? `${a.house_number} ${a.road}` : a.road,
      a.city || a.town || a.village || a.county,
      a.state,
    ].filter(Boolean);

    return parts.length >= 2 ? parts.join(', ') : item.display_name;
  };

  const formatSubLabel = (item) => {
    const a = item.address;
    if (!a) return null;
    const parts = [a.postcode, a.country].filter(Boolean);
    return parts.length ? parts.join(' · ') : null;
  };

  return (
    <div ref={containerRef} className="aac-root">
      <div className={`aac-input-wrap ${error ? 'aac-error' : ''} ${isLoading ? 'aac-loading' : ''}`}>
        <span className="aac-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </span>

        <input
          ref={inputRef}
          className="aac-input"
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={() => {
            if (!selected && results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-label="Address search"
          aria-autocomplete="list"
          aria-expanded={isOpen}
        />

        <span className="aac-suffix">
          {isLoading ? (
            <span className="aac-spinner" />
          ) : query.length > 0 ? (
            <button
              className="aac-clear"
              type="button"
              aria-label="Clear address"
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
                setSelected(false);
                onSelect?.({ address: '', lat: null, lng: null });
                inputRef.current?.focus();
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          ) : null}
        </span>
      </div>

      {error && <p className="aac-error-text">{error}</p>}

      {isOpen && results.length > 0 && (
        <ul className="aac-dropdown" role="listbox">
          {results.map((item, idx) => (
            <li
              key={item.place_id}
              role="option"
              aria-selected={idx === activeIndex}
              className={`aac-option ${idx === activeIndex ? 'aac-option--active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              onMouseEnter={() => setActiveIndex(idx)}>
              <span className="aac-option-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <span className="aac-option-text">
                <span className="aac-option-main">{formatLabel(item)}</span>
                {formatSubLabel(item) && (
                  <span className="aac-option-sub">{formatSubLabel(item)}</span>
                )}
              </span>
            </li>
          ))}
          <li className="aac-footer">
            Powered by{' '}
            <a href="https://nominatim.org" target="_blank" rel="noreferrer">
              OpenStreetMap / Nominatim
            </a>
          </li>
        </ul>
      )}
    </div>
  );
}