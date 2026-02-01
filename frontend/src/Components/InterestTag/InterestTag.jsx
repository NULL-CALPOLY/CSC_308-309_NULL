import React from 'react';
import './InterestTag.css';

export default function TagComponent(props) {
  const className = `Tag-Container ${props.Interest.trim().toLowerCase()}`;

  return (
    <div className={className}>
      <div className="Tag-Text">{props.Interest}</div>
    </div>
  );
}
