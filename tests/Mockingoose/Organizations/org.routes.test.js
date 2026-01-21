const request = require('supertest');
const mockingoose = require('mockingoose');
const app = require('../../backend/backend.js');
const orgModel = require('../../backend/OrganizationFiles/OrganizationSchema.js');

const dummyOrg = {
  _id: '507f191e810c19729de860aa',
  name: 'Tech Org 2026',
  email: 'techorg@example.com',
  phone: '1234567890',
  inviteOnly: false,
};

beforeEach(() => mockingoose.resetAll());

describe('Organization Routes (Jest + Mockingoose)', () => {
  test('GET /organizations returns working message', async () => {
    const res = await request(app).get('/organizations/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Yes, organizations info is working');
  });

  test('GET /organizations/all returns organizations', async () => {
    mockingoose(orgModel).toReturn([dummyOrg], 'find');
    const res = await request(app).get('/organizations/all');
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe(dummyOrg.name);
  });

  test('GET /organizations/:id returns an organization', async () => {
    mockingoose(orgModel).toReturn(dummyOrg, 'findOne');
    const res = await request(app).get(`/organizations/${dummyOrg._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(dummyOrg.name);
  });

  test('POST /organizations creates organization', async () => {
    mockingoose(orgModel).toReturn(dummyOrg, 'save');
    const res = await request(app).post('/organizations').send(dummyOrg);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(dummyOrg.name);
  });

  test('PUT /organizations/:id updates organization', async () => {
    const updatedOrg = { ...dummyOrg, phone: '0987654321' };
    mockingoose(orgModel).toReturn(updatedOrg, 'findOneAndUpdate');
    const res = await request(app).put(`/organizations/${dummyOrg._id}`).send({ phone: '0987654321' });
    expect(res.status).toBe(200);
    expect(res.body.data.phone).toBe('0987654321');
  });

  test('DELETE /organizations/:id deletes organization', async () => {
    mockingoose(orgModel).toReturn(dummyOrg, 'findOneAndDelete');
    const res = await request(app).delete(`/organizations/${dummyOrg._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(dummyOrg.name);
  });
});
