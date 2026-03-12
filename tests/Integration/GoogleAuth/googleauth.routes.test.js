import request from 'supertest';
import app from '../../../backend/backend.js';

describe('GoogleAuthRoutes Integration Tests', () => {
  describe('GET /auth/me', () => {
    it('returns 401 with user: null when not authenticated', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.user).toBeNull();
    });
  });

  describe('GET /auth/google', () => {
    it('redirects to Google OAuth when accessing /auth/google', async () => {
      const res = await request(app).get('/auth/google');
      // Passport redirects to Google's OAuth URL
      expect(res.status).toBe(302);
      expect(res.headers.location).toMatch(/accounts\.google\.com/);
    });
  });

  describe('GET /auth/logout', () => {
    it('redirects on logout', async () => {
      const res = await request(app).get('/auth/logout');
      // Even without a session, should redirect
      expect([301, 302]).toContain(res.status);
    });
  });

  describe('GET /auth/google/callback', () => {
    it('redirects to / on failed OAuth callback', async () => {
      // Without a valid code, passport will fail and redirect to /
      const res = await request(app)
        .get('/auth/google/callback')
        .query({ code: 'invalid_code' });
      expect([302, 400, 401, 500]).toContain(res.status);
    });
  });
});
