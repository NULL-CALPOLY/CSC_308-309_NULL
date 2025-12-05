import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from '../assets/pin.svg';
import locateIcon from '../assets/location.svg';
import './SmallMapComponent.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon,
});

export default function SmallMapComponent() {
  const [userPosition, setUserPosition] = useState(null);

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={true}
        className="map-component"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {!userPosition && (
          <Marker position={[35.3, -120.66]}>
            <Popup>stuff</Popup>
          </Marker>
        )}

        {userPosition && (
          <Marker position={userPosition}>
            <Popup>
              You are here <br />
              <b>Lat:</b> {userPosition[0].toFixed(5)} <br />
              <b>Lng:</b> {userPosition[1].toFixed(5)}
            </Popup>
          </Marker>
        )}

        <LocateButton icon={locateIcon} setUserPosition={setUserPosition} />
      </MapContainer>
    </div>
  );
}

// “Locate Me” button
function LocateButton({ icon, setUserPosition }) {
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
      },
      () => alert('Unable to retrieve your location.')
    );
  };

  return (
    <button className="locate-btn" onClick={handleLocate}>
      <img src={icon} alt="Locate me" />
    </button>
  );
}
