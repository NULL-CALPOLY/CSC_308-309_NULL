import React from "react";

export const MapContainer = ({ children }) => <div>{children}</div>;
export const TileLayer = () => <div />;
export const Marker = ({ children }) => <div>{children}</div>;
export const Popup = ({ children }) => <div>{children}</div>;
export const useMap = () => ({
  flyTo: jest.fn(),
  setView: jest.fn(),
});
