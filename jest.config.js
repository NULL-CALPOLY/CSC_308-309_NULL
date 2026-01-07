export default {
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-leaflet|@react-leaflet)/)"
  ],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/tests/__mocks__/styleMock.js",
    "\\.(svg|png|jpg|jpeg|gif)$": "<rootDir>/tests/__mocks__/fileMock.js",
    "^react-leaflet$": "<rootDir>/tests/__mocks__/react-leaflet.js",
    "^leaflet$": "<rootDir>/tests/__mocks__/leaflet.js"
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.cjs"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  moduleFileExtensions: ["js", "jsx"],
};