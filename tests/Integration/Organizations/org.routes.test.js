import request from 'supertest';
import app from '../../../backend/backend.js';
import organizationModel from '../../../backend/OrganizationFiles/OrganizationSchema.js';
import mongoose from 'mongoose';

// Sample organization for tests
const testOrganization = {
  name: 'Tech Org 2025',
  email: 'techorg@example.com',
  phone: '1234567890',
  inviteOnly: false,
};

beforeEach(async () => {
  await organizationModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Organization Routes', () => {
  test('GET /organizations returns working message', async () => {
    const res = await request(app).get('/organizations/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Yes, organizations info is working');
  });

  test('GET /organizations/all returns 404 when no organizations exist', async () => {
    const res = await request(app).get('/organizations/all');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('GET /organizations/all returns all organizations successfully', async () => {
    await organizationModel.create(testOrganization);
    const res = await request(app).get('/organizations/all');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('POST /organizations creates an organization', async () => {
    const res = await request(app)
      .post('/organizations')
      .send(testOrganization);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Tech Org 2025');
  });

  test('POST /organizations with invalid data fails', async () => {
    const res = await request(app).post('/organizations').send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test('GET /organizations/:id returns the created organization', async () => {
    const created = await organizationModel.create(testOrganization);
    const res = await request(app).get(`/organizations/${created._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(testOrganization.name);
  });

  test('GET /organizations/:id returns 404 for non-existent organization', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/organizations/${fakeId}`);
    expect(res.status).toBe(404);
  });

  test('PUT /organizations/:id updates the organization', async () => {
    const created = await organizationModel.create(testOrganization);
    const res = await request(app)
      .put(`/organizations/${created._id}`)
      .send({ phone: '0987654321' });
    expect(res.status).toBe(200);
    expect(res.body.data.phone).toBe('0987654321');
  });

  test('PUT /organizations/:id returns 404 for non-existent organization', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/organizations/${fakeId}`)
      .send({ phone: '9999999999' });
    expect(res.status).toBe(404);
  });

  test('DELETE /organizations/:id deletes the organization', async () => {
    const created = await organizationModel.create(testOrganization);
    const res = await request(app).delete(`/organizations/${created._id}`);
    expect(res.status).toBe(200);
    const deleted = await organizationModel.findById(created._id);
    expect(deleted).toBeNull();
  });

  test('DELETE /organizations/:id returns 404 for non-existent organization', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/organizations/${fakeId}`);
    expect(res.status).toBe(404);
  });

  // Search endpoints
  test('GET /organizations/search/name/:name finds organization by name', async () => {
    await organizationModel.create(testOrganization);
    const res = await request(app).get('/organizations/search/name/Tech');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /organizations/search/name/:name returns 404 when not found', async () => {
    const res = await request(app).get(
      '/organizations/search/name/NonExistent'
    );
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('GET /organizations/search/email/:email finds organization by email', async () => {
    await organizationModel.create(testOrganization);
    const res = await request(app).get(
      '/organizations/search/email/techorg@example.com'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /organizations/search/email/:email returns 404 when not found', async () => {
    const res = await request(app).get(
      '/organizations/search/email/nonexistent@example.com'
    );
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('GET /organizations/search/phone/:phone finds organization by phone', async () => {
    await organizationModel.create(testOrganization);
    const res = await request(app).get(
      '/organizations/search/phone/1234567890'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /organizations/search/phone/:phone returns 404 when not found', async () => {
    const res = await request(app).get(
      '/organizations/search/phone/9999999999'
    );
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('GET /organizations/search/invite/:invite finds organization by inviteOnly status', async () => {
    await organizationModel.create(testOrganization);
    const res = await request(app).get('/organizations/search/invite/false');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /organizations/search/invite/:invite returns 404 when not found', async () => {
    const res = await request(app).get('/organizations/search/invite/true');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('GET /organizations/all returns all organizations when they exist', async () => {
    await organizationModel.create(testOrganization);
    const res = await request(app).get('/organizations/all');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /organizations/search/member/:userId finds organizations for member', async () => {
    const memberId = new mongoose.Types.ObjectId();
    await organizationModel.create({
      ...testOrganization,
      members: [memberId],
    });
    const res = await request(app).get(
      `/organizations/search/member/${memberId}`
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /organizations/search/member/:userId returns 404 when not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(
      `/organizations/search/member/${fakeId}`
    );
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('PUT /organizations/:id/members/add/:userId adds user to members', async () => {
    const created = await organizationModel.create(testOrganization);
    const newMemberId = new mongoose.Types.ObjectId();

    const res = await request(app).put(
      `/organizations/${created._id}/members/add/${newMemberId}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.members.map(String)).toContain(newMemberId.toString());
  });

  test('PUT /organizations/:id/members/add/:userId returns 404 when org not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const res = await request(app).put(
      `/organizations/${fakeId}/members/add/${userId}`
    );
    expect(res.status).toBe(404);
  });

  test('PUT /organizations/:id/members/remove/:userId removes user from members', async () => {
    const memberId = new mongoose.Types.ObjectId();
    const created = await organizationModel.create({
      ...testOrganization,
      members: [memberId],
    });

    const res = await request(app).put(
      `/organizations/${created._id}/members/remove/${memberId}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.members.map(String)).not.toContain(
      memberId.toString()
    );
  });

  test('PUT /organizations/:id/members/remove/:userId returns 404 when org not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const res = await request(app).put(
      `/organizations/${fakeId}/members/remove/${userId}`
    );
    expect(res.status).toBe(404);
  });
});
