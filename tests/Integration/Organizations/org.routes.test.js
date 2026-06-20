import request from 'supertest';
import app from '../../../backend/backend.js';
import organizationModel from '../../../backend/OrganizationFiles/OrganizationSchema.js';
import userModel from '../../../backend/UserFiles/UserSchema.js';
import mongoose from 'mongoose';
import { authHeader } from '../../helpers/auth.js';

const ownerId = new mongoose.Types.ObjectId();

// Base org doc — owner is required by the schema now.
const baseOrg = {
  name: 'Tech Org 2025',
  email: 'techorg@example.com',
  phone: '1234567890',
  inviteOnly: false,
  owner: ownerId,
  admins: [ownerId],
  members: [ownerId],
};

// Create an org directly with a given status (default approved so it appears in
// the public catalog / is joinable).
function makeOrg(overrides = {}) {
  return organizationModel.create({
    ...baseOrg,
    status: 'approved',
    ...overrides,
  });
}

beforeEach(async () => {
  await organizationModel.deleteMany({});
  await userModel.deleteMany({});
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

  test('GET /organizations/all returns only approved organizations', async () => {
    await makeOrg({ status: 'approved' });
    await makeOrg({ name: 'Pending Club', status: 'pending' });
    const res = await request(app).get('/organizations/all');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Tech Org 2025');
  });

  test('POST /organizations requires auth', async () => {
    const res = await request(app).post('/organizations').send(baseOrg);
    expect(res.status).toBe(401);
  });

  test('POST /organizations creates a pending org owned by the requester', async () => {
    const res = await request(app)
      .post('/organizations')
      .set(authHeader(ownerId))
      .send({ name: 'New Club', email: 'new@club.com' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New Club');
    expect(res.body.data.status).toBe('pending');
    expect(String(res.body.data.owner)).toBe(String(ownerId));
  });

  test('POST /organizations cannot self-approve via the body', async () => {
    const res = await request(app)
      .post('/organizations')
      .set(authHeader(ownerId))
      .send({ name: 'Sneaky', email: 's@c.com', status: 'approved' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
  });

  test('GET /organizations/:id returns the organization', async () => {
    const created = await makeOrg();
    const res = await request(app).get(`/organizations/${created._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(baseOrg.name);
  });

  test('GET /organizations/:id returns 404 for non-existent organization', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/organizations/${fakeId}`);
    expect(res.status).toBe(404);
  });

  test('PUT /organizations/:id updates when requester is the owner', async () => {
    const created = await makeOrg();
    const res = await request(app)
      .put(`/organizations/${created._id}`)
      .set(authHeader(ownerId))
      .send({ phone: '0987654321' });
    expect(res.status).toBe(200);
    expect(res.body.data.phone).toBe('0987654321');
  });

  test('PUT /organizations/:id is forbidden for non-admins', async () => {
    const created = await makeOrg();
    const stranger = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/organizations/${created._id}`)
      .set(authHeader(stranger))
      .send({ phone: '0987654321' });
    expect(res.status).toBe(403);
  });

  test('DELETE /organizations/:id deletes when requester is the owner', async () => {
    const created = await makeOrg();
    const res = await request(app)
      .delete(`/organizations/${created._id}`)
      .set(authHeader(ownerId));
    expect(res.status).toBe(200);
    const deleted = await organizationModel.findById(created._id);
    expect(deleted).toBeNull();
  });

  // ── Admin approval workflow ──
  test('PUT /organizations/:id/approve requires admin', async () => {
    const created = await makeOrg({ status: 'pending' });
    const nonAdmin = await userModel.create({
      name: 'Reg',
      email: 'reg@example.com',
    });
    const res = await request(app)
      .put(`/organizations/${created._id}/approve`)
      .set(authHeader(nonAdmin._id));
    expect(res.status).toBe(403);
  });

  test('PUT /organizations/:id/approve approves a pending club for an admin', async () => {
    const created = await makeOrg({ status: 'pending' });
    const admin = await userModel.create({
      name: 'Admin',
      email: 'admin@example.com',
      isAdmin: true,
    });
    const res = await request(app)
      .put(`/organizations/${created._id}/approve`)
      .set(authHeader(admin._id));
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('approved');
    expect(String(res.body.data.reviewedBy)).toBe(String(admin._id));
  });

  test('PUT /organizations/:id/reject rejects with a reason for an admin', async () => {
    const created = await makeOrg({ status: 'pending' });
    const admin = await userModel.create({
      name: 'Admin',
      email: 'admin@example.com',
      isAdmin: true,
    });
    const res = await request(app)
      .put(`/organizations/${created._id}/reject`)
      .set(authHeader(admin._id))
      .send({ reason: 'Incomplete info' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('rejected');
    expect(res.body.data.rejectionReason).toBe('Incomplete info');
  });

  test('GET /organizations/pending lists pending clubs for an admin', async () => {
    await makeOrg({ status: 'pending' });
    await makeOrg({ name: 'Approved', status: 'approved' });
    const admin = await userModel.create({
      name: 'Admin',
      email: 'admin@example.com',
      isAdmin: true,
    });
    const res = await request(app)
      .get('/organizations/pending')
      .set(authHeader(admin._id));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  // ── Search ──
  test('GET /organizations/search/name/:name finds organization by name', async () => {
    await makeOrg();
    const res = await request(app).get('/organizations/search/name/Tech');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /organizations/search/email/:email finds organization by email', async () => {
    await makeOrg();
    const res = await request(app).get(
      '/organizations/search/email/techorg@example.com'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /organizations/search/member/:userId finds orgs for member', async () => {
    const memberId = new mongoose.Types.ObjectId();
    await makeOrg({ members: [memberId] });
    const res = await request(app).get(
      `/organizations/search/member/${memberId}`
    );
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // ── Membership (self only) ──
  test('PUT /members/add/:userId lets a user join an approved club', async () => {
    const created = await makeOrg({ status: 'approved' });
    const joinerId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/organizations/${created._id}/members/add/${joinerId}`)
      .set(authHeader(joinerId));
    expect(res.status).toBe(200);
    expect(res.body.data.members.map(String)).toContain(String(joinerId));
  });

  test('PUT /members/add/:userId cannot add someone else', async () => {
    const created = await makeOrg({ status: 'approved' });
    const me = new mongoose.Types.ObjectId();
    const other = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/organizations/${created._id}/members/add/${other}`)
      .set(authHeader(me));
    expect(res.status).toBe(403);
  });

  test('PUT /members/add blocks joining a non-approved club', async () => {
    const created = await makeOrg({ status: 'pending' });
    const joinerId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/organizations/${created._id}/members/add/${joinerId}`)
      .set(authHeader(joinerId));
    expect(res.status).toBe(403);
  });

  test('PUT /members/add enforces student-only clubs', async () => {
    const created = await makeOrg({ status: 'approved', studentOnly: true });
    const nonStudent = await userModel.create({
      name: 'Town Person',
      email: 'person@gmail.com',
      isVerifiedStudent: false,
    });
    const res = await request(app)
      .put(`/organizations/${created._id}/members/add/${nonStudent._id}`)
      .set(authHeader(nonStudent._id));
    expect(res.status).toBe(403);
  });

  test('PUT /members/remove/:userId lets a user leave', async () => {
    const memberId = new mongoose.Types.ObjectId();
    const created = await makeOrg({ members: [memberId] });
    const res = await request(app)
      .put(`/organizations/${created._id}/members/remove/${memberId}`)
      .set(authHeader(memberId));
    expect(res.status).toBe(200);
    expect(res.body.data.members.map(String)).not.toContain(String(memberId));
  });
});
