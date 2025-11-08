import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "../assets/pin.png";
import "./HomePage.css";
import SmallMapComponent from '../Components/SmallMapComponent.jsx'

// Configure default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon,
});

export default function HomePage() {
  return (
    <div>
      <h1> map Component </h1>
      <p> this is a small map component to get the locaiton of the user </p>
      <SmallMapComponent />
    </div>
  )
}
