import React, { useState } from "react";
import "./HomePage.css";
import SmallMapComponent from '../Components/SmallMapComponent.jsx'


export default function HomePage() {
  return (
    <div>
      <h1> map Component </h1>
      <p> this is a small map component to get the locaiton of the user </p>
      <SmallMapComponent />
    </div>
  )
}
