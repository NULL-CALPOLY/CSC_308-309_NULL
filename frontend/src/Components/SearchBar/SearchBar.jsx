import React, { useState, useEffect } from 'react';
import Checkbox from "@cloudscape-design/components/checkbox";
import './SearchBar.css';

export default function SearchBar({ onSelectionChange }) {
  const [interestOptions, setInterestOptions] = useState([]);
  const [checkedInterests, setCheckedInterests] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/interests/all')
      .then(res => res.json())
      .then(data => {
        const mappedOptions = data.map(interest => ({
          label: interest.name,
          value: interest.name,
        }));
        setInterestOptions(mappedOptions);

        const initialChecked = {};
        mappedOptions.forEach(opt => { initialChecked[opt.value] = false; });
        setCheckedInterests(initialChecked);
      })
      .catch(err => console.error('Failed to load interests:', err));
  }, []);

  const handleCheckboxChange = (interestValue, isChecked) => {
    setCheckedInterests(prev => {
      const updated = { ...prev, [interestValue]: isChecked };
      const selected = Object.keys(updated).filter(key => updated[key]);
      onSelectionChange(selected); // notify parent
      return updated;
    });
  };

  const filteredOptions = interestOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="searchbar-container">
      <input
        type="text"
        placeholder="Search interests..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="searchbar-input"
      />

      <div className="checkbox-grid">
        {filteredOptions.map(interest => (
          <div key={interest.value} className="checkbox-item">
            <Checkbox
              checked={checkedInterests[interest.value] || false}
              onChange={({ detail }) => handleCheckboxChange(interest.value, detail.checked)}
            >
              {interest.label}
            </Checkbox>
          </div>
        ))}
      </div>
    </div>
  );
}
