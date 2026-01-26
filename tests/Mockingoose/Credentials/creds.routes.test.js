const request = require('supertest');
const app = require('../../backend/backend.js');
const mockingoose = require('mockingoose');
const credentialModel = require('../../backend/Credentials/CredentialSchema.js');

const dummyCredential = {
  _id: '507f191e810c19729de86021',
  userId: 'user123',
  type: 'password',
  hash: 'hashedpassword',
};

beforeEach(() => mockingoose.resetAll());

describe('Credentials Routes (mocked)', () => {
  test('GET /credentials returns all credentials', async () => {
    mockingoose(credentialModel).toReturn([dummyCredential], 'find');
    const res = await request(app).get('/credentials');
    expect(res.status).toBe(200);
    expect(res.body.data[0].type).toBe('password');
  });

  test('POST /credentials creates credential', async () => {
    const input = { userId: 'user456', type: 'token', hash: 'hashedtoken' };
    mockingoose(credentialModel).toReturn({ ...input, _id: 'abc123' }, 'save');
    const res = await request(app).post('/credentials').send(input);
    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('token');
  });

  test('GET /credentials/:id returns credential', async () => {
    mockingoose(credentialModel).toReturn(dummyCredential, 'findOne');
    const res = await request(app).get(`/credentials/${dummyCredential._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.userId).toBe('user123');
  });
});
