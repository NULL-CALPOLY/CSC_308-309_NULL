import React from 'react';
import './InterestTag.css';

const COLORS = {
  basketball: '#ff6b6b',
  soccer: '#4dabf7',
  coding: '#51cf66',
  dance: '#845ef7',
  travel: '#ffa94d',
  gardening: '#28a745',
};

/**
 * Generates color based on the string/interest
 * Same interest = Same color
 */
function stringToColor(str) {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

export default function TagComponent({ Interest }) {
  if (!Interest) return null;

  const key = Interest.trim().toLowerCase();
  const color = COLORS[key] ?? stringToColor(key);

  return (
    <div className="Tag-Container" style={{ backgroundColor: color }}>
      <div className="Tag-Text">{Interest}</div>
    </div>
  );
}
