import React, { useState } from "react";
import "./HomePage.css";
import SmallMapComponent from '../Components/SmallMapComponent.jsx'
import RandomComponent from "../Components/RandomComponent.jsx";


const test_Event_List = [
  {
    eventName : "EventName",
    description : "Description",
    attendees : "Attendees",
    Host : "Host"
  }
]

export default function HomePage() {
  return (
    <div>
      <h1> map Component </h1>
      <p> this is a small map component to get the locaiton of the user </p>
      <SmallMapComponent />

      <RandomComponent 
      eventName = "Event Name"
      description = "Description"
      attendees = "Attendees"
      Host = "Host"
      />
    </div>
  )
}
