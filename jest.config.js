export default {
  // Run all test types by default
  projects: [
    // Frontend unit tests
    {
      displayName: 'unit-frontend',
      testEnvironment: 'jest-environment-jsdom',
      transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(react-leaflet|@react-leaflet)/)',
      ],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
        '^leaflet/dist/leaflet.css$': '<rootDir>/tests/__mocks__/styleMock.js',
        '\\.(svg|png|jpg|jpeg|gif)$': '<rootDir>/tests/__mocks__/fileMock.js',
        '^react-leaflet$': '<rootDir>/tests/__mocks__/react-leaflet.js',
        '^leaflet$': '<rootDir>/tests/__mocks__/leaflet.js',
      },
      setupFiles: [
        '<rootDir>/tests/setupNode.cjs',
        '<rootDir>/frontend/jest.setup.js',
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/setupDOM.js'],
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      moduleFileExtensions: ['js', 'jsx'],
    },

    // Integration tests (backend with MongoDB
    {
      displayName: 'integration',
      testEnvironment: 'node',
      transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
      },
      setupFiles: ['<rootDir>/tests/setupNode.cjs'],
      setupFilesAfterEnv: ['<rootDir>/tests/setupMemoryServer.js'],
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
      moduleFileExtensions: ['js', 'jsx'],
    },
  ],
};
