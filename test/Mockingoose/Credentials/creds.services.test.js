const mongoose = require('mongoose');
const mockingoose = require('mockingoose');

const credentialModel = require('../../backend/Credentials/CredentialSchema.js');
const credentialServices = require('../../backend/Credentials/CredentialServices.js');

beforeEach(() => {
  jest.clearAllMocks();
  mockingoose.resetAll();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Credential Services (Jest + Mockingoose)', () => {
  const dummyCredential = {
    _id: '507f191e810c19729de86021',
    userId: 'user123',
    type: 'password',
    hash: 'hashedpassword',
  };

  test('getAllCredentials returns credentials', async () => {
    mockingoose(credentialModel).toReturn([dummyCredential], 'find');
    const result = await credentialServices.getAllCredentials();
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('password');
  });

  test('addCredential successfully', async () => {
    const input = { userId: 'user456', type: 'token', hash: 'hashedtoken' };
    mockingoose(credentialModel).toReturn({ ...input, _id: 'abc123' }, 'save');
    const result = await credentialServices.addCredential(input);
    expect(result).toBeDefined();
    expect(result.type).toBe('token');
  });

  test('findCredentialById returns credential', async () => {
    mockingoose(credentialModel).toReturn(dummyCredential, 'findOne');
    const credential = await credentialServices.findCredentialById(dummyCredential._id);
    expect(credential.userId).toBe('user123');
  });

  test('updateCredential updates credential', async () => {
    const updated = { ...dummyCredential, type: 'apikey' };
    mockingoose(credentialModel).toReturn(updated, 'findOneAndUpdate');
    const result = await credentialServices.updateCredential(dummyCredential._id, { type: 'apikey' });
    expect(result.type).toBe('apikey');
  });

  test('deleteCredential deletes credential', async () => {
    mockingoose(credentialModel).toReturn(dummyCredential, 'findOneAndDelete');
    const result = await credentialServices.deleteCredential(dummyCredential._id);
    expect(result.type).toBe('password');
  });
});
