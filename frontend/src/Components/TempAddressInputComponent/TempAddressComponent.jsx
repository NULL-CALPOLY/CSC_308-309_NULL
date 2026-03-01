import React, { useEffect, useRef, useState } from 'react';
import './TempAddressComponent.css';
import Input from '@cloudscape-design/components/input';

export default function TempAddressComponent({
  onSelect,
  placeholder = 'Start typing an address...',
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);

  // Close dropdown if user clicks outside
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
    const q = query.trim();

    // Partial address autocomplete (3+ chars)
    if (q.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();

    const fetchAddresses = async () => {
      try {
        setLoading(true);

        // Use OUR backend geocode API (fast + cached)
        const res = await fetch(
          `http://localhost:3000/geocode/search?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          setResults([]);
          setOpen(false);
          return;
        }

        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Geocoding error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce so we don't spam while typing
    const debounce = setTimeout(fetchAddresses, 250);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query]);

  const pick = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    setQuery(item.display_name);
    setOpen(false);
    setResults([]);

    onSelect?.({ address: item.display_name, lat, lng });
  };

  return (
    <div ref={containerRef} className="autocomplete-container">
      <Input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={({ detail }) => setQuery(detail.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="autocomplete-input"
      />

      {loading && (
        <div style={{ fontSize: 12, marginTop: 4 }}>
          Searching…
        </div>
      )}

      {open && results.length > 0 && (
        <div className="autocomplete-dropdown">
          {results.map((item) => (
            <div
              key={item.place_id}
              className="autocomplete-item"
              onMouseDown={() => pick(item)}
            >
              {item.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
