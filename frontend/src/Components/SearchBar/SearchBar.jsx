import React, { useState } from 'react';
import Checkbox from '@cloudscape-design/components/checkbox';
import useInterests from '../../Hooks/useInterests';
import './SearchBar.css';

export default function SearchBar({ onSelectionChange, onDateChange }) {
  const { interests } = useInterests();
  const [checkedInterests, setCheckedInterests] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleCheckboxChange = (interestValue, isChecked) => {
    setCheckedInterests((prev) => {
      const updated = { ...prev, [interestValue]: isChecked };
      const selected = Object.keys(updated).filter((key) => updated[key]);
      onSelectionChange(selected);
      return updated;
    });
  };

  const handleDateChange = (newStart, newEnd) => {
    onDateChange({ startDate: newStart, endDate: newEnd });
  };

  const interestOptions = interests.map(i => ({
    label: i.name,
    value: i._id,
  }));

  const filteredOptions = interestOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
    onDateChange({ startDate: '', endDate: '' });
  };

  return (
    <div className="searchbar-container">

      {/* ── Interest search ── */}
      <input
        type="text"
        placeholder="Search interests..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="searchbar-input"
      />

      <div className="checkbox-grid">
        {filteredOptions.map((interest) => (
          <div key={interest.value} className="checkbox-item">
            <Checkbox
              checked={checkedInterests[interest.value] || false}
              onChange={({ detail }) =>
                handleCheckboxChange(interest.value, detail.checked)
              }>
              {interest.label}
            </Checkbox>
          </div>
        ))}
      </div>

      {/* ── Date filter ── */}
      <div className="date-filter">
        <p className="date-filter__label">Filter by date</p>
        <div className="date-filter__inputs">
          <div className="date-filter__field">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                handleDateChange(e.target.value, endDate);
              }}
              className="searchbar-input date-input"
            />
          </div>
          <div className="date-filter__field">
            <label>To</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                handleDateChange(startDate, e.target.value);
              }}
              className="searchbar-input date-input"
            />
          </div>
        </div>
        {(startDate || endDate) && (
          <button className="date-filter__clear" onClick={clearDates}>
            Clear dates
          </button>
        )}
      </div>

    </div>
  );
}