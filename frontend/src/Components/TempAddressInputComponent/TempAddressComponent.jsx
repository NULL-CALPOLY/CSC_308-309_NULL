import React, { useState, useEffect, useRef } from 'react';
import './TempAddressComponent.css'; // import the CSS file
import Input from '@cloudscape-design/components/input';

export default function TempAddressComponent({
  onSelect,
  placeholder = 'Start typing an address...',
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

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
    if (query.length < 10) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const fetchAddresses = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
              q: query,
              format: 'json',
              addressdetails: '1',
              limit: '5',
            }),
          {
            headers: { 'User-Agent': 'EventApp/1.0' },
            signal: controller.signal,
          }
        );

        const data = await res.json();
        setResults(data);
        setOpen(true);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Geocoding error:', err);
      }
    };

    const debounce = setTimeout(fetchAddresses, 300);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query]);

  return (
    <div ref={containerRef} className="autocomplete-container">
      <Input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={({ detail }) => setQuery(detail.value)}
        onFocus={() => query.length >= 3 && setOpen(true)}
        className="autocomplete-input"
      />

      {open && results.length > 0 && (
        <div className="autocomplete-dropdown">
          {results.map((item) => (
            <div
              key={item.place_id}
              className="autocomplete-item"
              onClick={() => {
                const lat = parseFloat(item.lat);
                const lng = parseFloat(item.lon);
                setQuery(item.display_name);
                setOpen(false);

                onSelect({ address: item.display_name, lat, lng });
              }}>
              {item.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
