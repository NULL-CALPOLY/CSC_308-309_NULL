import loginServices from '../../../backend/UserFiles/Credentials/LoginServices.js';
import loginModel from '../../../backend/UserFiles/Credentials/LoginSchema.js';
import mongoose from 'mongoose';

const testLogin = {
  email: 'test@example.com',
  password: 'password123',
};

beforeEach(async () => {
  await loginModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Login Services', () => {
  test('should create a new login credential', async () => {
    const login = await loginServices.addLogin(testLogin);

    expect(login.email).toBe('test@example.com');

    const found = await loginModel.findById(login._id);
    expect(found).not.toBeNull();
  });

  test('should get all logins', async () => {
    await loginModel.create(testLogin);

    const logins = await loginServices.getLogins();
    expect(logins.length).toBe(1);
  });

  test('should find login by ID', async () => {
    const login = await loginModel.create(testLogin);

    const found = await loginServices.findLoginById(login._id);
    expect(found.email).toBe('test@example.com');
  });

  test('should find login by email', async () => {
    await loginModel.create(testLogin);

    const found = await loginServices.findLoginByEmail(testLogin.email);
    expect(found.email).toBe('test@example.com');
  });

  test('should authenticate with correct password', async () => {
    await loginModel.create(testLogin);

    const auth = await loginServices.authenticate(
      'test@example.com',
      'password123'
    );

    expect(auth).not.toBeNull();
  });

  test('should reject authentication with incorrect password', async () => {
    await loginModel.create(testLogin);

    const auth = await loginServices.authenticate(
      'test@example.com',
      'wrongpass'
    );

    expect(auth).toBeNull();
  });

  test('should update login credentials', async () => {
    const login = await loginModel.create(testLogin);

    const updated = await loginServices.updateLogin(login._id, {
      email: 'updated@example.com',
    });

    expect(updated.email).toBe('updated@example.com');
  });

  test('should delete a login record', async () => {
    const login = await loginModel.create(testLogin);

    const deleted = await loginServices.deleteLogin(login._id);

    expect(deleted._id.toString()).toBe(login._id.toString());
  });
});
