import request from 'supertest';
import app from '../../../backend/backend.js';
import loginModel from '../../../backend/CredentialFiles/LoginSchema.js';
import mongoose from 'mongoose';

const testLogin = {
  email: 'test@example.com',
  password: 'password123',
};

beforeEach(async () => {
  await loginModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Login Routes', () => {
  beforeEach(async () => {
    await loginModel.deleteMany({});
  });

  test('GET /logins/all returns empty array initially', async () => {
    const res = await request(app).get('/logins/all');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('POST /logins creates new login credential', async () => {
    const res = await request(app).post('/logins').send(testLogin);

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe('test@example.com');
  });

  test('GET /logins/:id returns login', async () => {
    const login = await loginModel.create(testLogin);

    const res = await request(app).get(`/logins/${login._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('test@example.com');
  });

  test('POST /logins/login authenticates user', async () => {
    await loginModel.create(testLogin);

    const res = await request(app)
      .post('/logins/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /logins/login rejects wrong password', async () => {
    await loginModel.create(testLogin);

    const res = await request(app)
      .post('/logins/login')
      .send({ email: 'test@example.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  test('PUT /logins/:id updates login', async () => {
    const login = await loginModel.create(testLogin);

    const res = await request(app)
      .put(`/logins/${login._id}`)
      .send({ email: 'updated@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('updated@example.com');
  });

  test('DELETE /logins/:id deletes login', async () => {
    const login = await loginModel.create(testLogin);

    const res = await request(app).delete(`/logins/${login._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /logins/search/email/:email finds login', async () => {
    await loginModel.create(testLogin);

    const res = await request(app).get(
      `/logins/search/email/${testLogin.email}`
    );

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('test@example.com');
  });
});
