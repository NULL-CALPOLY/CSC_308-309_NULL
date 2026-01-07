require("@testing-library/jest-dom");

const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

global.navigator.geolocation = mockGeolocation;
