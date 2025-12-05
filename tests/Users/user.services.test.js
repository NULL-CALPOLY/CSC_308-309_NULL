import userServices from '../../backend/UserFiles/UserServices.js';
import userModel from '../../backend/UserFiles/UserSchema.js';
import mongoose from 'mongoose';

const baseUser = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  gender: 'Male',
  phoneNumber: '555-1234',
  radius: 10,
  interests: ['hiking', 'music'],
  location: {
    type: 'Point',
    coordinates: [-118.123, 34.123], // [lng, lat]
  },
};

beforeEach(async () => {
  await userModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('User Services', () => {
  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  test('should create a new user', async () => {
    const user = await userServices.addUser(baseUser);
    expect(user.name).toBe('John Doe');

    const found = await userModel.findById(user._id);
    expect(found.email).toBe('john@example.com');
  });

  test('should return all users', async () => {
    await userModel.create(baseUser);
    await userModel.create({
      ...baseUser,
      email: 'second@example.com',
      name: 'Jane',
    });

    const users = await userServices.getUsers();
    expect(users.length).toBe(2);
  });

  test('should find a user by ID', async () => {
    const user = await userModel.create(baseUser);

    const found = await userServices.findUserById(user._id);
    expect(found.email).toBe('john@example.com');
  });

  test('should find users by name (case insensitive)', async () => {
    await userModel.create(baseUser);

    const results = await userServices.findUserByName('john');
    expect(results.length).toBe(1);
  });

  test('should find users by email', async () => {
    await userModel.create(baseUser);

    const results = await userServices.findUserByEmail('john@example.com');
    expect(results.length).toBe(1);
  });

  test('should find users by phone number', async () => {
    await userModel.create(baseUser);

    const results = await userServices.findUserByPhoneNumber('555-1234');
    expect(results.length).toBe(1);
  });

  test('should find users by age', async () => {
    await userModel.create(baseUser);

    const results = await userServices.findUserByAge(30);
    expect(results.length).toBe(1);
  });

  test('should find users by gender', async () => {
    await userModel.create(baseUser);

    const results = await userServices.findUserByGender('Male');
    expect(results.length).toBe(1);
  });

  test('should find users by interests', async () => {
    await userModel.create(baseUser);

    const results = await userServices.findUserByInterests(['music']);
    expect(results.length).toBe(1);
  });

  test('should find users by radius', async () => {
    await userModel.create(baseUser);

    const results = await userServices.findUserByRadius(10);
    expect(results.length).toBe(1);
  });

  test('should find users within geographic radius', async () => {
    await userModel.create(baseUser);

    const latitude = 34.123;
    const longitude = -118.123;
    const radiusInMiles = 5;

    const results = await userServices.findUserByLocation(
      latitude,
      longitude,
      radiusInMiles
    );
    expect(results.length).toBe(1);
  });

  test('should update a user', async () => {
    const user = await userModel.create(baseUser);

    const updated = await userServices.updateUser(user._id, {
      name: 'Updated Name',
    });
    expect(updated.name).toBe('Updated Name');
  });

  test('should delete a user', async () => {
    const user = await userModel.create(baseUser);

    const deleted = await userServices.deleteUser(user._id);
    expect(deleted._id.toString()).toBe(user._id.toString());

    const shouldBeGone = await userModel.findById(user._id);
    expect(shouldBeGone).toBeNull();
  });
});
