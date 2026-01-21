import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from '../assets/pin.png';
import locateIcon from '../assets/location.svg';
import './SmallMapComponent/SmallMapComponent.css';

// Custom marker icon
const EventIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon,
  iconSize: [45, 45], 
  iconAnchor: [17, 45], 
  popupAnchor: [0, -40], 
});

export default function RegistrationMap({ onLocationSelect }) {
  const [selectedPosition, setSelectedPosition] = useState(null);

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={true}
        className="map-component">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          setSelectedPosition={setSelectedPosition}
          onLocationSelect={onLocationSelect}
        />

        {selectedPosition && <Marker position={selectedPosition} icon={EventIcon} />}

        <LocateButton
          icon={locateIcon}
          setPosition={(pos) => {
            setSelectedPosition(pos);
            onLocationSelect(pos[0], pos[1]);
          }}
        />
      </MapContainer>
    </div>
  );
}

// Click map to drop a marker
function MapClickHandler({ setSelectedPosition, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const pos = [e.latlng.lat, e.latlng.lng];
      setSelectedPosition(pos);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// "Locate Me" button
function LocateButton({ icon, setPosition }) {
  const map = useMap();

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        setPosition(latlng);
        map.flyTo(latlng, 15);
      },
      () => alert('Unable to retrieve location.')
    );
  };

  return (
    <button className="locate-btn" onClick={handleLocate}>
      <img src={icon} alt="Locate me" />
    </button>
  );
}
