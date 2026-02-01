const L = {
  Icon: class Icon {
    constructor(options) {
      this.options = options;
    }
  },
  icon: jest.fn((options) => ({ options })),
  map: jest.fn(() => ({
    setView: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    off: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
    invalidateSize: jest.fn().mockReturnThis(),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
  })),
  latLng: jest.fn((lat, lng) => ({ lat, lng })),
  latLngBounds: jest.fn(() => ({
    extend: jest.fn().mockReturnThis(),
    isValid: jest.fn(() => true),
  })),
  control: {
    zoom: jest.fn(() => ({
      addTo: jest.fn(),
    })),
  },
};

module.exports = L;
