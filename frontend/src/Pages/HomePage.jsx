import React, { useState } from "react";
import "./HomePage.css";
import MainMapComponent from '../Components/MainMapComponent.jsx'
import RandomComponent from "../Components/EventComponent.jsx";


const test_Event_List = [
  {
    eventName : "basketball game",
    eventTime: "5pm",
    eventAddress : "PAC",
    description : "Description",
    attendees : "Attendees",
    Host : "Host",
    Interest : "sports",
  },
  {
    eventName : "Drawing Club",
    eventTime: "5pm",
    eventAddress : "Room 205",
    description : "Description",
    attendees : "Attendees",
    Host : "Host",
    Interest : "art",
  },
  {
    eventName : "Jazz band",
    eventTime: "5pm",
    eventAddress : "PAC",
    description : "Description",
    attendees : "Attendees",
    Host : "Host",
    Interest : "music",
  },
  {
    eventName : "Foreign Exchange club",
    eventTime: "5pm",
    eventAddress : "Dexter Lawn",
    description : "Description",
    attendees : "Attendees",
    Host : "Host",
    Interest : "travel",
  },
  {
    eventName : "hackathon",
    eventTime: "5pm",
    eventAddress : "PAC",
    description : "Description",
    attendees : "Attendees",
    Host : "Host",
    Interest : "coding",
  },
  {
    eventName : "Soccer Game",
    eventTime: "5pm",
    eventAddress : "lower field",
    description : "Description",
    attendees : "Attendees",
    Host : "Host",
    Interest : "sports",
  },

]

export default function HomePage() {
  return (
    <div className="HomePage">
      <div className="Event_Container">
        <div className="Search_Bar">
          <input placeholder="Search events…" />
        </div>
        <div className="Event_List">
        {test_Event_List.map((event, index) => (
          <RandomComponent
            key={index}
            eventName={event.eventName}
            eventTime={event.eventTime}
            eventAddress={event.eventAddress}
            description={event.description}
            attendees={event.attendees}
            host={event.host}
            interest={event.Interest}
          />
        ))}
        </div>
      </div>
      <div className="Map">
        <MainMapComponent/>
      </div>
    </div>
  );
}
