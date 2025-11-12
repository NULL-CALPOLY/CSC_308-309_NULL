// src/Components/Navbar.jsx
import React from "react";


export default function RandomComponent(props) {

  return (
    <div className="Event-Container">
      <div className="Event-Title">
        {props.eventName}
      </div>
    </div>
  );
}
