const request = require('supertest');
const mockingoose = require('mockingoose');
const app = require('../../backend/backend.js');
const userModel = require('../../backend/UserFiles/UserSchema.js');

const dummyUser = {
  _id: '507f191e810c19729de860ea',
  name: 'John Doe',
  email: 'john@example.com',
  phoneNumber: '555-1234',
  gender: 'Male',
};

beforeEach(() => {
  mockingoose.resetAll();
});

describe('User Routes (Jest + Mockingoose)', () => {
  test('GET /users returns working message', async () => {
    const res = await request(app).get('/users/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Yes, user info is working');
  });

  test('GET /users/all returns users', async () => {
    mockingoose(userModel).toReturn([dummyUser], 'find');
    const res = await request(app).get('/users/all');
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('John Doe');
  });

  test('GET /users/:id returns a user', async () => {
    mockingoose(userModel).toReturn(dummyUser, 'findOne');
    const res = await request(app).get(`/users/${dummyUser._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('John Doe');
  });

  test('POST /users creates a user', async () => {
    mockingoose(userModel).toReturn(dummyUser, 'save');
    const res = await request(app).post('/users').send(dummyUser);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('John Doe');
  });

  test('PUT /users/:id updates a user', async () => {
    const updatedUser = { ...dummyUser, name: 'Jane Doe' };
    mockingoose(userModel).toReturn(updatedUser, 'findOneAndUpdate');
    const res = await request(app)
      .put(`/users/${dummyUser._id}`)
      .send({ name: 'Jane Doe' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Jane Doe');
  });

  test('DELETE /users/:id deletes a user', async () => {
    mockingoose(userModel).toReturn(dummyUser, 'findOneAndDelete');
    const res = await request(app).delete(`/users/${dummyUser._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('John Doe');
  });
});
