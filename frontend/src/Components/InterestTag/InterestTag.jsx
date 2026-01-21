import React from 'react';
import './InterestTag.css';

const COLORS = {
  basketball: '#ff6b6b',
  soccer: '#4dabf7',
  coding: '#51cf66',
  dance: '#845ef7',
  travel: '#ffa94d',
  gardening: '#28a745',
  default: '#868e96',
};

export default function TagComponent({ Interest }) {
  const tagKey = Interest.trim().toLowerCase();
  const color = COLORS[tagKey] || COLORS.default;

  return (
    <div className="Tag-Container" style={{ backgroundColor: color }}>
      <div className="Tag-Text">{Interest}</div>
    </div>
  );
}
