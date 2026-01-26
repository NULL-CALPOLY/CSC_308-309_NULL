import React from 'react';

const mockMapInstance = {
  flyTo: jest.fn(),
  setView: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
};

export const MapContainer = ({ children, ...props }) => {
  return (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  );
};

export const TileLayer = (props) => <div data-testid="tile-layer" {...props} />;

export const Marker = ({ children, ...props }) => (
  <div data-testid="marker" {...props}>
    {children}
  </div>
);

export const Popup = ({ children, ...props }) => (
  <div data-testid="popup" {...props}>
    {children}
  </div>
);

export const useMap = () => mockMapInstance;
