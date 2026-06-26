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
    <div className="flex flex-1 flex-col justify-start items-stretch bg-[#0a0a0f] w-full h-full">
      <MapContainer
        center={[35.3, -120.66]}
        zoom={13}
        minZoom={3}
        maxZoom={18}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        zoomControl={true}
        className="flex-1 w-full">
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
        <div className="flex flex-col gap-[6px] min-w-[200px] font-[inherit]">
          <div className="text-[15px] font-bold text-[#f8fafc] mb-[2px] overflow-wrap-break-word">{event.eventName}</div>

          <div className="flex items-start gap-[6px] text-[12.5px] text-[rgba(248,250,252,0.6)]">
            <span className="text-[12px] mt-[1px]">📅</span>
            <span>{event.eventDate}</span>
          </div>

          <div className="flex items-start gap-[6px] text-[12.5px] text-[rgba(248,250,252,0.6)]">
            <span className="text-[12px] mt-[1px]">📍</span>
            <span>{event.eventAddress}</span>
          </div>

          <div className="flex items-start gap-[6px] text-[12.5px] text-[rgba(248,250,252,0.6)]">
            <span className="text-[12px] mt-[1px]">👥</span>
            <span>{event.attendees?.length ?? 0} attending</span>
          </div>

          {event.interests.length > 0 && (
            <div className="flex flex-wrap gap-[4px] mt-[2px]">
              {event.interests.slice(0, 3).map((tag, i) => (
                <span key={i} className="bg-[rgba(124,58,237,0.18)] text-[#a78bfa] text-[11px] font-medium py-[2px] px-[8px] rounded-[20px] border border-[rgba(124,58,237,0.3)]">{tag}</span>
              ))}
            </div>
          )}

          <button
            className="mt-[6px] bg-[#7c3aed] text-white border-none rounded-[6px] py-[7px] px-[12px] text-[12.5px] font-semibold cursor-pointer w-full transition-[background] duration-150 hover:bg-[#6d28d9]"
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
    <button
      className="absolute bottom-[10px] right-[15px] bg-[rgba(10,10,18,0.9)] border border-[rgba(124,58,237,0.35)] rounded-full p-[8px] shadow-[0_2px_12px_rgba(0,0,0,0.4)] cursor-pointer z-[1000] transition-[transform,background] duration-[100ms,200ms] hover:scale-110 hover:bg-[rgba(124,58,237,0.15)]"
      onClick={handleLocate}
      title="Show my location">
      <img src={icon} alt="Locate me" className="w-[22px] h-[22px] block invert" />
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
