import React, { useState, useRef, useEffect } from 'react';
import useInterests from '../../Hooks/UseInterests';
import './SearchBar.css';

export default function SearchBar({ onSelectionChange, onDateChange }) {
  const { interests } = useInterests();
  const [selected, setSelected] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expanded, setExpanded] = useState(false);

  const interestOptions = interests.map((i) => ({ label: i.name, value: i.name }));

  const filtered = interestOptions.filter((o) =>
    o.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleInterest = (value) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      onSelectionChange([...next]);
      return next;
    });
  };

  const clearAll = () => {
    setSelected(new Set());
    onSelectionChange([]);
    setSearchTerm('');
  };

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
    onDateChange({ startDate: '', endDate: '' });
  };

  const COLLAPSED_MAX = 8;
  const visibleOptions = expanded ? filtered : filtered.slice(0, COLLAPSED_MAX);
  const hasMore = filtered.length > COLLAPSED_MAX;

  return (
    <div className="sb-container">
      {/* ── Header ── */}
      <div className="sb-header">
        <span className="sb-label">Filters</span>
        {selected.size > 0 && (
          <button className="sb-clear-all" onClick={clearAll}>
            Clear all ({selected.size})
          </button>
        )}
      </div>

      {/* ── Interest search ── */}
      <div className="sb-search-wrap">
        <svg className="sb-search-icon" width="13" height="13" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          className="sb-search-input"
          type="text"
          placeholder="Search interests…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ── Pill chips ── */}
      <div className="sb-pills">
        {visibleOptions.map((opt) => (
          <button
            key={opt.value}
            className={`sb-pill${selected.has(opt.value) ? ' sb-pill--on' : ''}`}
            onClick={() => toggleInterest(opt.value)}>
            {selected.has(opt.value) && <span className="sb-pill-check">✓</span>}
            {opt.label}
          </button>
        ))}
        {hasMore && (
          <button className="sb-pill sb-pill--more" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Show less' : `+${filtered.length - COLLAPSED_MAX} more`}
          </button>
        )}
        {filtered.length === 0 && (
          <span className="sb-no-results">No matches</span>
        )}
      </div>

      {/* ── Date filter ── */}
      <div className="sb-date">
        <div className="sb-date-header">
          <span className="sb-label">Date range</span>
          {(startDate || endDate) && (
            <button className="sb-clear-all" onClick={clearDates}>Clear</button>
          )}
        </div>
        <div className="sb-date-row">
          <div className="sb-date-field">
            <label className="sb-date-label">From</label>
            <input
              type="date"
              className="sb-date-input"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                onDateChange({ startDate: e.target.value, endDate });
              }}
            />
          </div>
          <div className="sb-date-sep">—</div>
          <div className="sb-date-field">
            <label className="sb-date-label">To</label>
            <input
              type="date"
              className="sb-date-input"
              value={endDate}
              min={startDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                onDateChange({ startDate, endDate: e.target.value });
              }}
            />
          </div>
        </div>
        {/* Quick-select shortcuts */}
        <div className="sb-quick-btns">
          {[
            { label: 'Today', fn: () => { const d = new Date(); const s = d.toISOString().slice(0,10); setStartDate(s); setEndDate(s); onDateChange({ startDate: s, endDate: s }); } },
            { label: 'This week', fn: () => { const d = new Date(); const start = new Date(d); start.setDate(d.getDate() - d.getDay()); const end = new Date(start); end.setDate(start.getDate() + 6); const s = start.toISOString().slice(0,10); const e = end.toISOString().slice(0,10); setStartDate(s); setEndDate(e); onDateChange({ startDate: s, endDate: e }); } },
            { label: 'This month', fn: () => { const d = new Date(); const s = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0,10); const e = new Date(d.getFullYear(), d.getMonth()+1, 0).toISOString().slice(0,10); setStartDate(s); setEndDate(e); onDateChange({ startDate: s, endDate: e }); } },
          ].map(({ label, fn }) => (
            <button key={label} className="sb-quick-btn" onClick={fn}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
