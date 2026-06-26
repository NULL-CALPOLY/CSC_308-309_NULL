import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useNavigate } from 'react-router-dom';
import { useUpcomingEvents, useNearbyEvents } from '../../Hooks/UseEvents';
import { useToast } from '../Toast/ToastContext.jsx';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import markerIcon from '../../assets/event-pin.svg';
import locateIcon from '../../assets/location.svg';
import circle from '../../assets/circle.png';
import './MainMapComponent.css';

const NEARBY_RADIUS = 16093;

const makeEventIcon = (selected) =>
  L.divIcon({
    html: `<img src="${markerIcon}" class="event-marker-img" alt="" />`,
    iconSize: [40, 52],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
    className: selected
      ? 'event-marker-wrapper is-selected'
      : 'event-marker-wrapper',
  });

const currentLocationIcon = L.icon({
  iconUrl: circle,
  iconRetinaUrl: circle,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

export default function MainMapComponent({ selectedId = null, onSelect, userCoords, onCoordsChange }) {
  const [userPosition, setUserPosition] = useState(null);
  const [tracking, setTracking] = useState(false);

  const { events: allEvents } = useUpcomingEvents();
  const { events: nearbyEvents } = useNearbyEvents(userCoords, NEARBY_RADIUS);

  const rawEvents = userCoords ? nearbyEvents : allEvents;
  const events = rawEvents.filter(
    (e) => e.lat !== 0 && e.lng !== 0 && e.lat != null && e.lng != null
  );

  const selectedEvent = events.find((e) => e.id === selectedId) || null;

  return (
    <div className="main-map-wrapper">
      <MapContainer
        center={[35.3, -120.66]}
        zoom={13}
        minZoom={3}
        maxZoom={18}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        zoomControl={true}
        className="main-map-component">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          referrerPolicy="no-referrer-when-downgrade"
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

        <MarkerClusterGroup
          chunkedLoading
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          maxClusterRadius={50}>
          {events.map((event) => (
            <EventMarker
              key={event.id}
              event={event}
              isSelected={event.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </MarkerClusterGroup>

        {selectedEvent && <FlyToSelected event={selectedEvent} />}

        <LocateButton
          icon={locateIcon}
          setUserPosition={setUserPosition}
          tracking={tracking}
          setTracking={setTracking}
          onCoordsChange={onCoordsChange}
        />

        {tracking && <LiveLocation setUserPosition={setUserPosition} />}
      </MapContainer>
    </div>
  );
}

function FlyToSelected({ event }) {
  const map = useMap();
  useEffect(() => {
    if (event?.lat == null || event?.lng == null) return;
    const targetZoom =
      typeof map.getZoom === 'function' ? Math.max(map.getZoom(), 15) : 15;
    map.flyTo([event.lat, event.lng], targetZoom, { duration: 0.6 });
  }, [event?.id, map]);
  return null;
}

function EventMarker({ event, isSelected = false, onSelect }) {
  const navigate = useNavigate();

  return (
    <Marker
      position={[event.lat, event.lng]}
      icon={makeEventIcon(isSelected)}
      eventHandlers={{ click: () => onSelect?.(event.id) }}>
      <Popup className="event-popup">
        <div className="popup-content">
          <div className="popup-title">{event.eventName}</div>

          <div className="popup-row">
            <span className="popup-icon">📅</span>
            <span>{event.eventDate}</span>
          </div>

          <div className="popup-row">
            <span className="popup-icon">📍</span>
            <span>{event.eventAddress}</span>
          </div>

          <div className="popup-row">
            <span className="popup-icon">👥</span>
            <span>{event.attendees?.length ?? 0} attending</span>
          </div>

          {event.interests.length > 0 && (
            <div className="popup-tags">
              {event.interests.slice(0, 3).map((tag, i) => (
                <span key={i} className="popup-tag">{tag}</span>
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

function LocateButton({ icon, setUserPosition, setTracking, onCoordsChange }) {
  const map = useMap();
  const toast = useToast();

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.warning('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const latlng = [lat, lng];
        setUserPosition(latlng);
        map.flyTo(latlng, 15);
        setTracking((prev) => !prev);
        onCoordsChange?.({ lat, lng });
      },
      () => toast.warning('Unable to retrieve your location. Check browser permissions.')
    );
  };

  return (
    <button className="main-locate-btn" onClick={handleLocate} title="Show my location">
      <img src={icon} alt="Locate me" />
    </button>
  );
}

function LiveLocation({ setUserPosition }) {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(latlng);
        map.setView(latlng);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, setUserPosition]);

  return null;
}
