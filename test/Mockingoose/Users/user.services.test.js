const mongoose = require('mongoose');
const mockingoose = require('mockingoose');

const userModel = require('../../backend/UserFiles/UserSchema.js');
const userServices = require('../../backend/UserFiles/UserServices.js');

beforeEach(() => {
  jest.clearAllMocks();
  mockingoose.resetAll();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('User Services (Jest + Mockingoose)', () => {
  const dummyUser = {
    _id: '507f191e810c19729de860ea',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '555-1234',
    gender: 'Male',
    radius: 10,
    location: { type: 'Point', coordinates: [-118.123, 34.123] },
    dateOfBirth: new Date('1994-06-15'),
    interests: ['music', 'hiking'],
  };

  test('getUsers returns all users', async () => {
    mockingoose(userModel).toReturn([dummyUser], 'find');
    const users = await userServices.getUsers();
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe(dummyUser.name);
  });

  test('findUserById returns a user', async () => {
    mockingoose(userModel).toReturn(dummyUser, 'findOne');
    const user = await userServices.findUserById(dummyUser._id);
    expect(user).toBeDefined();
    expect(user.name).toBe(dummyUser.name);
  });

  test('findUserById returns null if not found', async () => {
    mockingoose(userModel).toReturn(null, 'findOne');
    const user = await userServices.findUserById(dummyUser._id);
    expect(user).toBeNull();
  });

  test('addUser successfully adds a user', async () => {
    const inputUser = { ...dummyUser };
    delete inputUser._id;
    mockingoose(userModel).toReturn(dummyUser, 'save');
    const added = await userServices.addUser(inputUser);
    expect(added).toBeDefined();
    expect(added.name).toBe(dummyUser.name);
  });

  test('addUser fails with invalid data', async () => {
    const invalidUser = { name: 'No email' };
    mockingoose(userModel).toReturn(false, 'save');
    const added = await userServices.addUser(invalidUser);
    expect(added).toBeFalsy();
  });

  test('updateUser updates a user', async () => {
    const updates = { name: 'Jane Doe' };
    const updatedUser = { ...dummyUser, ...updates };
    mockingoose(userModel).toReturn(updatedUser, 'findOneAndUpdate');
    const result = await userServices.updateUser(dummyUser._id, updates);
    expect(result.name).toBe('Jane Doe');
  });

  test('deleteUser deletes a user', async () => {
    mockingoose(userModel).toReturn(dummyUser, 'findOneAndDelete');
    const deleted = await userServices.deleteUser(dummyUser._id);
    expect(deleted.name).toBe(dummyUser.name);
  });

  test('findUserByName returns users by name', async () => {
    mockingoose(userModel).toReturn([dummyUser], 'find');
    const users = await userServices.findUserByName('John Doe');
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('John Doe');
  });

  test('findUserByEmail returns users by email', async () => {
    mockingoose(userModel).toReturn([dummyUser], 'find');
    const users = await userServices.findUserByEmail('john@example.com');
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe('john@example.com');
  });

  test('findUserByPhoneNumber returns users by phone', async () => {
    mockingoose(userModel).toReturn([dummyUser], 'find');
    const users = await userServices.findUserByPhoneNumber('555-1234');
    expect(users).toHaveLength(1);
    expect(users[0].phoneNumber).toBe('555-1234');
  });
});
