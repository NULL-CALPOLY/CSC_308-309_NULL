import request from 'supertest';
import app from '../../backend/backend.js';
import userModel from '../../backend/UserFiles/UserSchema.js';
import mongoose from 'mongoose';

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  gender: 'Male',
  phoneNumber: '555-1234',
  radius: 10,
  location: {
    type: 'Point',
    coordinates: [-118.123, 34.123], // [lng, lat]
  },
  dateOfBirth: new Date('1999-06-15'),
};

const testUser2 = {
  name: 'Another User',
  email: 'another@example.com',
  gender: 'Female',
  phoneNumber: '999-4444',
  radius: 20,
  location: {
    type: 'Point',
    coordinates: [-70, 40], // [lng, lat]
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
  test('GET /users/all returns 404 when no users exist', async () => {
    const res = await request(app).get('/users/all');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('POST /users creates a user', async () => {
    const res = await request(app).post('/users').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test User');
  });

  test('GET /users/:id returns a user', async () => {
    const newUser = await userModel.create(testUser);
    const res = await request(app).get(`/users/${newUser._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('test@example.com');
  });

  test('GET /users/:id returns 404 for missing user', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/users/${fakeId}`);
    expect(res.status).toBe(404);
  });

  test('DELETE /users/:id deletes a user', async () => {
    const user = await userModel.create(testUser);
    const res = await request(app).delete(`/users/${user._id}`);
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
    const user = await userModel.create(testUser);
    const res = await request(app)
      .put(`/users/${user._id}`)
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

  test('GET /users/search/name/:name returns matching users', async () => {
    await userModel.create(testUser);
    const res = await request(app).get('/users/search/name/Test User');
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Test User');
  });

  test('GET /users/search/email/:email returns matching users', async () => {
    await userModel.create(testUser);
    const res = await request(app).get('/users/search/email/test@example.com');
    expect(res.status).toBe(200);
    expect(res.body.data[0].email).toBe('test@example.com');
  });

  test('GET /users/search/gender/:gender returns matching users', async () => {
    await userModel.create(testUser);
    const res = await request(app).get('/users/search/gender/Male');
    expect(res.status).toBe(200);
    expect(res.body.data[0].gender).toBe('Male');
  });

  test('GET /users/search/interests/:interests returns matching users', async () => {
    await userModel.create(testUser2);
    const res = await request(app).get('/users/search/interests/music');
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Another User');
  });

  test('GET /users/search/radius/:radius returns users by radius', async () => {
    await userModel.create(testUser);
    const res = await request(app).get('/users/search/radius/10');
    expect(res.status).toBe(200);
    expect(res.body.data[0].radius).toBe(10);
  });

  test('GET /users/search/location/:location returns nearby users', async () => {
    await userModel.create(testUser);
    const loc = '34.123,-118.123,10';
    const res = await request(app).get(`/users/search/location/${loc}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test('GET /users/search/dob/:dob finds users by exact date of birth', async () => {
    await userModel.create(testUser);
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
      dateOfBirth: new Date(`${currentYear - 25}-06-15`),
    };
    await userModel.create(userWithAge25);
    const expectedAge = 25;
    const res = await request(app).get(`/users/search/dob/${expectedAge}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test('GET /users/search/dob/:dob returns 404 when no DOB match', async () => {
    await userModel.create(testUser);
    const res = await request(app).get('/users/search/dob/1999-12-31');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
