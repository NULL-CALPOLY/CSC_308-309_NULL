import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from '../../assets/pin.png';
import locateIcon from '../../assets/location.svg';
import circle from '../../assets/circle.png';
import './MainMapComponent.css';

const EventIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon,
  iconSize: [45, 45],
  iconAnchor: [17, 45],
  popupAnchor: [0, -40],
});

const currentLocationIcon = new L.Icon({
  iconUrl: circle,
  iconRetinaUrl: circle,
  iconSize: [20, 20],
  iconAnchor: [17, 45],
  popupAnchor: [0, -40],
});

export default function MainMapComponent() {
  const [userPosition, setUserPosition] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}events/all`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        // Map API data to match EventComponent props
        const mappedEvents = data.data.map((event) => {
          const [lng, lat] = event.location.coordinates;
          return {
            eventName: event.name,
            description: event.description,
            lat,
            lng,
          };
        });

        setEvents(mappedEvents);
      })
      .catch((err) => console.error('Failed to load events:', err));
  }, []);

  return (
    <div className="main-map-wrapper">
      <MapContainer
        center={[35.3, -120.66]}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={true}
        className="main-map-component">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userPosition && (
          <Marker position={userPosition} icon={currentLocationIcon}>
            <Popup>
              You are here <br />
              <b>Lat:</b> {userPosition[0].toFixed(5)} <br />
              <b>Lng:</b> {userPosition[1].toFixed(5)}
            </Popup>
          </Marker>
        )}

        {events.map((event, idx) => (
          <Marker key={idx} position={[event.lat, event.lng]} icon={EventIcon}>
            <Popup>
              <b>{event.eventName}</b>
              <br />
              {event.description}
              <br />
            </Popup>
          </Marker>
        ))}

        <LocateButton
          icon={locateIcon}
          setUserPosition={setUserPosition}
          tracking={tracking}
          setTracking={setTracking}
        />

        {tracking && <LiveLocation setUserPosition={setUserPosition} />}
      </MapContainer>
    </div>
  );
}

// “Locate Me” button
function LocateButton({ icon, setUserPosition, setTracking }) {
  const map = useMap();

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(latlng); // ✅ update parent state
        map.flyTo(latlng, 15);
        console.log('📍 Current location:', latlng); // ✅ log to console
        setTracking((prev) => !prev);
      },
      () => alert('Unable to retrieve your location.')
    );
  };

  return (
    <button className="main-locate-btn" onClick={handleLocate}>
      <img src={icon} alt="Locate me" />
    </button>
  );
}

function LiveLocation({ setUserPosition }) {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(latlng);
        map.setView(latlng);
        console.log('📍 Updated live location:', latlng);
      },
      (err) => console.error('Unable to retrieve location:', err),
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    // ✅ Cleanup watcher on unmount
    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, setUserPosition]);

  return null;
}
