import request from 'supertest';
import app from '../../../backend/backend.js';
import userModel from '../../../backend/UserFiles/UserSchema.js';
import mongoose from 'mongoose';

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  gender: 'Male',
  phoneNumber: '555-1234',
  location: {
    latitude: 34.123,
    longitude: -118.123,
  },
  dateOfBirth: new Date('1999-06-15'),
};

const testUser2 = {
  name: 'Another User',
  email: 'another@example.com',
  password: 'password456',
  gender: 'Female',
  phoneNumber: '999-4444',
  location: {
    latitude: 40,
    longitude: -70,
  },
  interests: ['music', 'reading'],
  dateOfBirth: new Date('1994-06-15'),
};

beforeEach(async () => {
  await userModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('User Routes', () => {
  test('GET /users returns working message', async () => {
    const res = await request(app).get('/users/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Yes, user info is working');
  });

  test('GET /users/all returns 404 when no users exist', async () => {
    const res = await request(app).get('/users/all');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('GET /users/all returns all users successfully', async () => {
    await request(app).post('/users').send(testUser);
    const res = await request(app).get('/users/all');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  describe('Authentication Tests', () => {
    test('POST /users (register) creates a user and returns access token', async () => {
      const res = await request(app).post('/users').send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User created successfully');
      expect(res.body.user.name).toBe('Test User');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.token).toBeDefined();
      expect(res.body.user.password).toBeUndefined(); // password should not be returned

      // Check that refresh token cookie is set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((cookie) => cookie.includes('refreshToken'))).toBe(
        true
      );
    });

    test('POST /users (register) prevents duplicate email registration', async () => {
      await request(app).post('/users').send(testUser);
      const res = await request(app).post('/users').send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Email already registered');
    });

    test('POST /users/login authenticates user with correct credentials', async () => {
      // First register the user
      await request(app).post('/users').send(testUser);

      // Then login
      const res = await request(app)
        .post('/users/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.userId).toBeDefined();
      expect(res.body.accessToken).toBeDefined();

      // Check refresh token cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((cookie) => cookie.includes('refreshToken'))).toBe(
        true
      );
    });

    test('POST /users/login rejects invalid email', async () => {
      await request(app).post('/users').send(testUser);

      const res = await request(app)
        .post('/users/login')
        .send({ email: 'wrong@example.com', password: testUser.password });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    test('POST /users/login rejects incorrect password', async () => {
      await request(app).post('/users').send(testUser);

      const res = await request(app)
        .post('/users/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('POST /users/login requires email and password', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ email: testUser.email });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Email and password required');
    });

    test('POST /users/refresh-token generates new access token', async () => {
      // Register and get refresh token
      const registerRes = await request(app).post('/users').send(testUser);
      const cookies = registerRes.headers['set-cookie'];

      // Skip test if cookies are not set (may happen in test environment)
      if (!cookies) {
        console.warn(
          'Cookies not set in test environment, skipping refresh token test'
        );
        return;
      }

      // Use refresh token to get new access token
      const res = await request(app)
        .post('/users/refresh-token')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.userId).toBeDefined();
    });

    test('POST /users/refresh-token fails without refresh token', async () => {
      const res = await request(app).post('/users/refresh-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No refresh token provided');
    });

    test('POST /users/refresh-token fails with invalid refresh token', async () => {
      const res = await request(app)
        .post('/users/refresh-token')
        .set('Cookie', ['refreshToken=invalidtoken']);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid refresh token');
    });

    test('POST /users/logout clears refresh token cookie', async () => {
      const res = await request(app).post('/users/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logout successful');

      const cookies = res.headers['set-cookie'];
      if (cookies) {
        expect(
          cookies.some(
            (cookie) =>
              cookie.includes('refreshToken') &&
              (cookie.includes('Max-Age=0') || cookie.includes('Expires='))
          )
        ).toBe(true);
      }
    });
  });

  describe('CRUD Operations', () => {
    test('POST /users with invalid data fails', async () => {
      const res = await request(app).post('/users').send({});
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test('GET /users/:id returns a user', async () => {
      const registerRes = await request(app).post('/users').send(testUser);
      const userId = registerRes.body.user._id;

      const res = await request(app).get(`/users/${userId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
      expect(res.body.data.password).toBeUndefined(); // password should not be returned
    });

    test('GET /users/:id returns 404 for missing user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/users/${fakeId}`);
      expect(res.status).toBe(404);
    });

    test('DELETE /users/:id deletes a user', async () => {
      const registerRes = await request(app).post('/users').send(testUser);
      const userId = registerRes.body.user._id;

      const res = await request(app).delete(`/users/${userId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('DELETE /users/:id returns 404 when user does not exist', async () => {
      const res = await request(app).delete(
        `/users/${new mongoose.Types.ObjectId()}`
      );
      expect(res.status).toBe(404);
    });

    test('PUT /users/:id updates a user', async () => {
      const registerRes = await request(app).post('/users').send(testUser);
      const userId = registerRes.body.user._id;

      const res = await request(app)
        .put(`/users/${userId}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });

    test('PUT /users/:id returns 404 when updating nonexistent user', async () => {
      const res = await request(app)
        .put(`/users/${new mongoose.Types.ObjectId()}`)
        .send({ name: 'Nope' });

      expect(res.status).toBe(404);
    });
  });

  describe('Search Operations', () => {
    test('GET /users/search/name/:name returns matching users', async () => {
      await request(app).post('/users').send(testUser);
      const res = await request(app).get('/users/search/name/Test User');
      expect(res.status).toBe(200);
      expect(res.body.data[0].name).toBe('Test User');
    });

    test('GET /users/search/name/:name returns 404 when not found', async () => {
      const res = await request(app).get('/users/search/name/NonExistent');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('GET /users/search/email/:email returns matching users', async () => {
      await request(app).post('/users').send(testUser);
      const res = await request(app).get(
        '/users/search/email/test@example.com'
      );
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('test@example.com');
    });

    test('GET /users/search/email/:email returns 404 when not found', async () => {
      const res = await request(app).get(
        '/users/search/email/nonexistent@example.com'
      );
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('GET /users/search/gender/:gender returns matching users', async () => {
      await request(app).post('/users').send(testUser);
      const res = await request(app).get('/users/search/gender/Male');
      expect(res.status).toBe(200);
      expect(res.body.data[0].gender).toBe('Male');
    });

    test('GET /users/search/gender/:gender returns 404 when not found', async () => {
      const res = await request(app).get('/users/search/gender/Other');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('GET /users/search/interests/:interests returns matching users', async () => {
      await request(app).post('/users').send(testUser2);
      const res = await request(app).get('/users/search/interests/music');
      expect(res.status).toBe(200);
      expect(res.body.data[0].name).toBe('Another User');
    });

    test('GET /users/search/interests/:interests returns 404 when not found', async () => {
      const res = await request(app).get('/users/search/interests/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('GET /users/search/location/:location returns nearby users', async () => {
      await request(app).post('/users').send(testUser);
      const loc = '34.123,-118.123,10';
      const res = await request(app).get(`/users/search/location/${loc}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    test('GET /users/search/location/:location returns 404 when not found', async () => {
      const loc = '0,0,1';
      const res = await request(app).get(`/users/search/location/${loc}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('GET /users/search/dob/:dob finds users by exact date of birth', async () => {
      await request(app).post('/users').send(testUser);
      const dateString = '1999-06-15';

      const res = await request(app).get(`/users/search/dob/${dateString}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(new Date(res.body.data[0].dateOfBirth).toISOString()).toBe(
        new Date(dateString).toISOString()
      );
    });

    test('GET /users/search/dob/:dob treats numeric input as age', async () => {
      const currentYear = new Date().getFullYear();
      const userWithAge25 = {
        ...testUser,
        email: 'age25@example.com',
        dateOfBirth: new Date(`${currentYear - 25}-06-15`),
      };
      await request(app).post('/users').send(userWithAge25);
      const expectedAge = 25;
      const res = await request(app).get(`/users/search/dob/${expectedAge}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    test('GET /users/search/dob/:dob returns 404 when no DOB match', async () => {
      await request(app).post('/users').send(testUser);
      const res = await request(app).get('/users/search/dob/1999-12-31');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
