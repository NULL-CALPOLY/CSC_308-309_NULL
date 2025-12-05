import React, { useState } from 'react';
import './HomePage.css';
import MainMapComponent from '../Components/MainMapComponent/MainMapComponent.jsx';
import RandomComponent from '../Components/EventComponent/EventComponent.jsx';
import EventColumn from '../Components/EventColumn/EventColumn.jsx';

// Example data, replace with Backend call for events
const test_Event_List = [
  {
    eventName: 'basketball game',
    eventTime: '5pm',
    eventAddress: 'PAC',
    description: 'Description',
    attendees: 'Attendees',
    Host: 'Host',
    Interest: 'sports',
  },
  {
    eventName: 'Drawing Club',
    eventTime: '5pm',
    eventAddress: 'Room 205',
    description: 'Description',
    attendees: 'Attendees',
    Host: 'Host',
    Interest: 'art',
  },
  {
    eventName: 'Jazz band',
    eventTime: '5pm',
    eventAddress: 'PAC',
    description: 'Description',
    attendees: 'Attendees',
    Host: 'Host',
    Interest: 'music',
  },
  {
    eventName: 'Foreign Exchange club',
    eventTime: '5pm',
    eventAddress: 'Dexter Lawn',
    description: 'Description',
    attendees: 'Attendees',
    Host: 'Host',
    Interest: 'travel',
  },
  {
    eventName: 'hackathon',
    eventTime: '5pm',
    eventAddress: 'PAC',
    description: 'Description',
    attendees: 'Attendees',
    Host: 'Host',
    Interest: 'coding',
  },
  {
    eventName: 'Soccer Game',
    eventTime: '5pm',
    eventAddress: 'lower field',
    description: 'Description',
    attendees: 'Attendees',
    Host: 'Host',
    Interest: 'sports',
  },
];

export default function HomePage() {
  return (
    <div className="HomePage">
      <div className="Map">
        <MainMapComponent />
      </div>
      <div className="Event-Column">
        <EventColumn eventList={test_Event_List} />
      </div>
    </div>
  );
}
