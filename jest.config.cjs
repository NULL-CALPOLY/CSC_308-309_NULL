const path = require('path');

module.exports = {
  // Ignore integration-level manual mocks to avoid duplicate mock filenames
  modulePathIgnorePatterns: ['<rootDir>/tests/Integration/__mocks__'],
  projects: [
    // Frontend unit tests
    {
      displayName: 'unit-frontend',
      testEnvironment: 'jest-environment-jsdom',
      transform: {
        '^.+\\.[jt]sx?$': [
          'babel-jest',
          { configFile: path.join(__dirname, 'babel.config.cjs') },
        ],
      },
      transformIgnorePatterns: [
        'node_modules/(?!(react-leaflet|@react-leaflet|@cloudscape-design)/)',
      ],
      moduleDirectories: [
        'node_modules',
        path.join(__dirname, 'frontend/node_modules'),
      ],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
        '^leaflet/dist/leaflet.css$': '<rootDir>/tests/__mocks__/styleMock.js',
        '\\.(svg|png|jpg|jpeg|gif)$': '<rootDir>/tests/__mocks__/fileMock.js',
        '^react-leaflet$': '<rootDir>/tests/__mocks__/react-leaflet.js',
        '^leaflet$': '<rootDir>/tests/__mocks__/leaflet.js',
        // Removed custom react and react-dom mappers to fix CI resolution errors
      },
      setupFiles: [
        '<rootDir>/tests/setupNode.cjs',
        '<rootDir>/frontend/jest.setup.js',
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/setupDOM.cjs'],
      testMatch: [
        '<rootDir>/tests/unit/**/*.test.js',
        '<rootDir>/tests/unit/**/*.test.jsx',
      ],
      moduleFileExtensions: ['js', 'jsx'],
    },

    // Integration tests (backend with MongoDB)
    {
      displayName: 'integration',
      testEnvironment: 'node',
      transform: {
        '^.+\\.[jt]sx?$': [
          'babel-jest',
          { configFile: path.join(__dirname, 'babel.config.cjs') },
        ],
      },
      setupFiles: ['<rootDir>/tests/setupNode.cjs'],
      setupFilesAfterEnv: ['<rootDir>/tests/setupMemoryServer.cjs'],
      testMatch: ['<rootDir>/tests/Integration/**/*.test.js'],
      moduleFileExtensions: ['js', 'jsx'],
    },
  ],
};
