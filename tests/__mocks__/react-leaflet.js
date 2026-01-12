import React from "react";

export const MapContainer = ({ children }) => (
  <div data-testid="map-container">{children}</div>
);

export const TileLayer = () => <div data-testid="tile-layer" />;

export const Marker = ({ children }) => (
  <div data-testid="marker">{children}</div>
);

export const Popup = ({ children }) => <div>{children}</div>;

export const useMap = () => ({
  flyTo: jest.fn(),
  setView: jest.fn(),
});
