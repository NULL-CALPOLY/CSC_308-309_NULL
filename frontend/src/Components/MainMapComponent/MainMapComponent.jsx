import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useUpcomingEvents } from '../../Hooks/UseEvents';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from '../../assets/pin.png';
import locateIcon from '../../assets/location.svg';
import circle from '../../assets/circle.png';
import './MainMapComponent.css';

const EventIcon = L.divIcon({
  html: `<img src="${markerIcon}" class="event-marker-img" />`,
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -48],
  className: 'event-marker-wrapper',
});

const currentLocationIcon = L.icon({
  iconUrl: circle,
  iconRetinaUrl: circle,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

export default function MainMapComponent() {
  const [userPosition, setUserPosition] = useState(null);
  const [tracking, setTracking] = useState(false);
  const { events: rawEvents } = useUpcomingEvents();

  const events = rawEvents.filter(
    (e) => e.lat !== 0 && e.lng !== 0 && e.lat != null && e.lng != null
  );

  return (
    <div className="main-map-wrapper">
      <MapContainer
        center={[35.3, -120.66]}
        zoom={13}
        minZoom={3}
        maxZoom={18}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        zoomControl={true}
        className="main-map-component">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Current user location marker */}
        {userPosition && (
          <Marker position={userPosition} icon={currentLocationIcon}>
            <Popup>
              You are here <br />
              <b>Lat:</b> {userPosition[0].toFixed(5)} <br />
              <b>Lng:</b> {userPosition[1].toFixed(5)}
            </Popup>
          </Marker>
        )}

        {/* Event markers */}
        {events.map((event) => (
          <EventMarker key={event.id} event={event} />
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

// Individual event marker with popup
function EventMarker({ event }) {
  const navigate = useNavigate();

  const formatTime = (isoString) => {
    if (!isoString) return 'TBD';
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Marker position={[event.lat, event.lng]} icon={EventIcon}>
      <Popup className="event-popup">
        <div className="popup-content">
          <div className="popup-title">{event.eventName}</div>

          <div className="popup-row">
            <span className="popup-icon">📍</span>
            <span>{event.address}</span>
          </div>

          <div className="popup-row">
            <span className="popup-icon">🕐</span>
            <span>{formatTime(event.startTime)}</span>
          </div>

          <div className="popup-row">
            <span className="popup-icon">👥</span>
            <span>{event.attendees.length} attending</span>
          </div>

          {event.interests.length > 0 && (
            <div className="popup-tags">
              {event.interests.slice(0, 3).map((tag, i) => (
                <span key={i} className="popup-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <button
            className="popup-btn"
            onClick={() => navigate(`/events/${event.id}`)}>
            View Event
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

// "Locate Me" button
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
        setUserPosition(latlng);
        map.flyTo(latlng, 15);
        console.log('📍 Current location:', latlng);
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

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, setUserPosition]);

  return null;
}
