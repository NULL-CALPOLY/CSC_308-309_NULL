import React from 'react';

const mockMapInstance = {
  flyTo: jest.fn(),
  setView: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
};

export const MapContainer = ({ children }) => {
  return <div data-testid="map-container">{children}</div>;
};

export const TileLayer = () => <div data-testid="tile-layer" />;

export const Marker = ({ children }) => (
  <div data-testid="marker">{children}</div>
);

export const Popup = ({ children }) => (
  <div data-testid="popup">{children}</div>
);

export const useMap = () => mockMapInstance;
