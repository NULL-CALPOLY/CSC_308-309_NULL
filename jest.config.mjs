export default {
  testEnvironment: 'node',
  roots: ['./tests'],
  setupFiles: ['<rootDir>/tests/setupNode.cjs'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  // only run backend service/route tests in this project
  testMatch: ['<rootDir>/tests/**/?(*.)+(services|routes).test.js'],
  // use Babel for all JS/JSX files
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  // allow transforming node_modules (needed for some ESM packages like bson)
  transformIgnorePatterns: [],
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '^leaflet/dist/leaflet.css$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(svg|png|jpg|jpeg|gif)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '^react-leaflet$': '<rootDir>/tests/__mocks__/react-leaflet.js',
    '^leaflet$': '<rootDir>/tests/__mocks__/leaflet.js',
  },
};
