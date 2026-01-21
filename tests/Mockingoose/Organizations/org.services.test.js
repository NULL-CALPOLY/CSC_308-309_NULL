const mongoose = require('mongoose');
const mockingoose = require('mockingoose');

const orgModel = require('../../backend/OrganizationFiles/OrganizationSchema.js');
const orgServices = require('../../backend/OrganizationFiles/OrganizationServices.js');

beforeEach(() => {
  jest.clearAllMocks();
  mockingoose.resetAll();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Organization Services (Jest + Mockingoose)', () => {
  const dummyOrg = {
    _id: '507f191e810c19729de860aa',
    name: 'Tech Org 2026',
    email: 'techorg@example.com',
    phone: '1234567890',
    inviteOnly: false,
    members: [],
  };

  test('addOrganization successfully', async () => {
    const inputOrg = { ...dummyOrg };
    delete inputOrg._id;
    mockingoose(orgModel).toReturn(dummyOrg, 'save');
    const added = await orgServices.addOrganization(inputOrg);
    expect(added).toBeDefined();
    expect(added.name).toBe(dummyOrg.name);
  });

  test('findOrganizationById returns organization', async () => {
    mockingoose(orgModel).toReturn(dummyOrg, 'findOne');
    const org = await orgServices.findOrganizationById(dummyOrg._id);
    expect(org.name).toBe(dummyOrg.name);
  });

  test('updateOrganization updates organization', async () => {
    const updatedOrg = { ...dummyOrg, phone: '0987654321' };
    mockingoose(orgModel).toReturn(updatedOrg, 'findOneAndUpdate');
    const org = await orgServices.updateOrganization(dummyOrg._id, { phone: '0987654321' });
    expect(org.phone).toBe('0987654321');
  });

  test('deleteOrganization deletes organization', async () => {
    mockingoose(orgModel).toReturn(dummyOrg, 'findOneAndDelete');
    const org = await orgServices.deleteOrganization(dummyOrg._id);
    expect(org.name).toBe(dummyOrg.name);
  });
});
