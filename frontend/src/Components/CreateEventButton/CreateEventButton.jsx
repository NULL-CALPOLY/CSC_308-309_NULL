import React from 'react';
import './CreateEventButton.css';

export default function CreateEventButton({ onClick }) {
  return (
    <button className="create-event-btn" onClick={onClick}>
      +
    </button>
  );
}
