// This file mocks import.meta.env for Jest tests
Object.defineProperty(globalThis, 'importMeta', {
  value: {
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000/' // or your test API base URL
    }
  },
  writable: true,
});
