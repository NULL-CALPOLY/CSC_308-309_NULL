import organizationServices from '../../backend/OrganizationFiles/OrganizationServices.js';
import organizationModel from '../../backend/OrganizationFiles/OrganizationSchema.js';
import mongoose from 'mongoose';

const testOrganization = {
  name: 'Tech Org 2026',
  email: 'techorg@example.com',
  phoneNumber: '1234567890',
  inviteOnly: false,
  members: [],
};

beforeEach(async () => {
  await organizationModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Organization Services', () => {
  it('should create a new organization', async () => {
    const org = await organizationServices.addOrganization(testOrganization);
    expect(org.name).toBe('Tech Org 2026');

    const found = await organizationModel.findById(org._id);
    expect(found.email).toBe('techorg@example.com');
  });

  it('should find organization by ID', async () => {
    const org = await organizationModel.create(testOrganization);
    const found = await organizationServices.findOrganizationById(org._id);
    expect(found._id.toString()).toBe(org._id.toString());
  });

  it('should find organizations by name', async () => {
    await organizationModel.create(testOrganization);
    const results = await organizationServices.findOrganizationByName('Tech');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should find organizations by email', async () => {
    await organizationModel.create(testOrganization);
    const results = await organizationServices.findOrganizationByEmail('techorg@example.com');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should find organizations by phone number', async () => {
    await organizationModel.create(testOrganization);
    const results = await organizationServices.findOrganizationByPhoneNumber('1234567890');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should find organizations by inviteOnly status', async () => {
    await organizationModel.create(testOrganization);
    const results = await organizationServices.findOrganizationByInviteOnly(false);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should update an organization', async () => {
    const org = await organizationModel.create(testOrganization);
    const updated = await organizationServices.updateOrganization(org._id, {
      name: 'Updated Org',
    });
    expect(updated.name).toBe('Updated Org');
  });

  it('should delete an organization', async () => {
    const org = await organizationModel.create(testOrganization);
    const deleted = await organizationServices.deleteOrganization(org._id);
    expect(deleted._id.toString()).toBe(org._id.toString());
    const found = await organizationModel.findById(org._id);
    expect(found).toBeNull();
  });

  it('should find organizations by member', async () => {
    const memberId = new mongoose.Types.ObjectId();
    const org = await organizationModel.create({ ...testOrganization, members: [memberId] });
    const results = await organizationServices.findOrganizationByMember(memberId);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should add a user to members', async () => {
    const org = await organizationModel.create(testOrganization);
    const newMember = new mongoose.Types.ObjectId();
    const updated = await organizationServices.addUserToMembers(org._id, newMember);
    expect(updated.members.map(id => id.toString())).toContain(newMember.toString());
  });

  it('should remove a user from members', async () => {
    const memberId = new mongoose.Types.ObjectId();
    const org = await organizationModel.create({ ...testOrganization, members: [memberId] });
    const updated = await organizationServices.removeUserFromMembers(org._id, memberId);
    expect(updated.members.map(id => id.toString())).not.toContain(memberId.toString());
  });

  it('should get all organizations', async () => {
    await organizationModel.create(testOrganization);
    const results = await organizationServices.getOrganizations();
    expect(results.length).toBeGreaterThan(0);
  });
});
