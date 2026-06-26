import React, { useState, useRef, useEffect } from 'react';
import useInterests from '../../Hooks/UseInterests';

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
    <div className="w-full box-border flex flex-col gap-2.5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.07em] text-[rgba(248,250,252,0.4)]">Filters</span>
        {selected.size > 0 && (
          <button
            className="bg-none border-none p-0 text-[0.72rem] font-semibold text-[#a78bfa] cursor-pointer opacity-80 transition-opacity duration-150 hover:opacity-100 hover:underline"
            onClick={clearAll}>
            Clear all ({selected.size})
          </button>
        )}
      </div>

      {/* ── Interest search ── */}
      <div className="relative">
        <svg
          className="absolute left-[9px] top-1/2 -translate-y-1/2 text-[rgba(248,250,252,0.3)] pointer-events-none"
          width="13"
          height="13"
          viewBox="0 0 14 14"
          fill="none">
          <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          className="w-full box-border py-[7px] pr-[10px] pl-7 rounded-[8px] border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.05)] text-[#f8fafc] text-[0.82rem] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[rgba(248,250,252,0.28)] focus:border-[rgba(124,58,237,0.5)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
          type="text"
          placeholder="Search interests…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ── Pill chips ── */}
      <div className="flex flex-wrap gap-[5px] max-h-[160px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(124,58,237,0.3)_transparent] [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-[rgba(124,58,237,0.3)] [&::-webkit-scrollbar-thumb]:rounded-[10px]">
        {visibleOptions.map((opt) => (
          <button
            key={opt.value}
            className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-full border text-[0.75rem] font-medium cursor-pointer whitespace-nowrap transition-all duration-150 ${
              selected.has(opt.value)
                ? 'bg-[rgba(124,58,237,0.22)] border-[rgba(124,58,237,0.55)] text-[#e9d5ff] font-semibold'
                : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.1)] text-[rgba(248,250,252,0.65)] hover:border-[rgba(124,58,237,0.45)] hover:text-[#e9d5ff] hover:bg-[rgba(124,58,237,0.08)]'
            }`}
            onClick={() => toggleInterest(opt.value)}>
            {selected.has(opt.value) && (
              <span className="text-[0.65rem] text-[#a78bfa]">✓</span>
            )}
            {opt.label}
          </button>
        ))}
        {hasMore && (
          <button
            className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full border border-dashed border-[rgba(124,58,237,0.35)] bg-transparent text-[#a78bfa] text-[0.75rem] font-medium cursor-pointer whitespace-nowrap transition-all duration-150 hover:bg-[rgba(124,58,237,0.08)]"
            onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Show less' : `+${filtered.length - COLLAPSED_MAX} more`}
          </button>
        )}
        {filtered.length === 0 && (
          <span className="text-[0.78rem] text-[rgba(248,250,252,0.3)] py-1 px-0.5">No matches</span>
        )}
      </div>

      {/* ── Date filter ── */}
      <div className="border-t border-[rgba(255,255,255,0.07)] pt-2.5 flex flex-col gap-[7px]">
        <div className="flex items-center justify-between">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.07em] text-[rgba(248,250,252,0.4)]">Date range</span>
          {(startDate || endDate) && (
            <button
              className="bg-none border-none p-0 text-[0.72rem] font-semibold text-[#a78bfa] cursor-pointer opacity-80 transition-opacity duration-150 hover:opacity-100 hover:underline"
              onClick={clearDates}>
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex flex-col gap-[3px]">
            <label className="text-[0.68rem] font-semibold text-[rgba(248,250,252,0.35)] uppercase tracking-[0.06em]">From</label>
            <input
              type="date"
              className="w-full box-border py-1.5 px-2 rounded-[8px] border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.05)] text-[#f8fafc] text-[max(16px,0.8rem)] outline-none transition-[border-color,box-shadow] duration-200 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:[filter:invert(0.6)] [&::-webkit-calendar-picker-indicator]:cursor-pointer focus:border-[rgba(124,58,237,0.5)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                onDateChange({ startDate: e.target.value, endDate });
              }}
            />
          </div>
          <div className="text-[rgba(248,250,252,0.25)] text-[0.85rem] pt-4">—</div>
          <div className="flex-1 flex flex-col gap-[3px]">
            <label className="text-[0.68rem] font-semibold text-[rgba(248,250,252,0.35)] uppercase tracking-[0.06em]">To</label>
            <input
              type="date"
              className="w-full box-border py-1.5 px-2 rounded-[8px] border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.05)] text-[#f8fafc] text-[max(16px,0.8rem)] outline-none transition-[border-color,box-shadow] duration-200 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:[filter:invert(0.6)] [&::-webkit-calendar-picker-indicator]:cursor-pointer focus:border-[rgba(124,58,237,0.5)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
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
        <div className="flex gap-[5px] flex-wrap">
          {[
            { label: 'Today', fn: () => { const d = new Date(); const s = d.toISOString().slice(0,10); setStartDate(s); setEndDate(s); onDateChange({ startDate: s, endDate: s }); } },
            { label: 'This week', fn: () => { const d = new Date(); const start = new Date(d); start.setDate(d.getDate() - d.getDay()); const end = new Date(start); end.setDate(start.getDate() + 6); const s = start.toISOString().slice(0,10); const e = end.toISOString().slice(0,10); setStartDate(s); setEndDate(e); onDateChange({ startDate: s, endDate: e }); } },
            { label: 'This month', fn: () => { const d = new Date(); const s = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0,10); const e = new Date(d.getFullYear(), d.getMonth()+1, 0).toISOString().slice(0,10); setStartDate(s); setEndDate(e); onDateChange({ startDate: s, endDate: e }); } },
          ].map(({ label, fn }) => (
            <button
              key={label}
              className="py-[3px] px-[9px] rounded-full border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] text-[rgba(248,250,252,0.5)] text-[0.72rem] cursor-pointer transition-all duration-150 hover:border-[rgba(124,58,237,0.4)] hover:text-[#a78bfa] hover:bg-[rgba(124,58,237,0.07)]"
              onClick={fn}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
