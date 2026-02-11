import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import userServices from '../../../backend/UserFiles/UserServices.js';
import userModel from '../../../backend/UserFiles/UserSchema.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const baseUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  gender: 'Male',
  phoneNumber: '555-1234',
  interests: ['hiking', 'music'],
  location: {
    latitude: 34.123,
    longitude: -118.123,
  },
  dateOfBirth: new Date('1994-06-15'),
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

  describe('Authentication Services', () => {
    test('should authenticate user with correct credentials', async () => {
      await userServices.addUser(baseUser);

      const result = await userServices.authenticateUser(
        baseUser.email,
        baseUser.password
      );

      expect(result).not.toBeNull();
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('john@example.com');
      // Note: password exclusion happens at Schema level via toJSON
    });

    test('should reject authentication with incorrect password', async () => {
      await userServices.addUser(baseUser);

      const result = await userServices.authenticateUser(
        baseUser.email,
        'wrongpassword'
      );

      expect(result).toBeNull();
    });

    test('should reject authentication with non-existent email', async () => {
      const result = await userServices.authenticateUser(
        'nonexistent@example.com',
        'password123'
      );

      expect(result).toBeNull();
    });

    test('should reject authentication for user without password', async () => {
      // Create user without password (OAuth user scenario)
      const oauthUser = {
        name: 'OAuth User',
        email: 'oauth@example.com',
        googleId: '123456',
      };
      await userModel.create(oauthUser);

      const result = await userServices.authenticateUser(
        'oauth@example.com',
        'anypassword'
      );

      expect(result).toBeNull();
    });
  });

  describe('User CRUD Operations', () => {
    test('should create a new user with hashed password', async () => {
      const user = await userServices.addUser(baseUser);
      
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');

      const found = await userModel.findById(user._id);
      expect(found.email).toBe('john@example.com');
      
      // Verify password is hashed in database
      expect(found.password).toBeDefined();
      expect(found.password).not.toBe(baseUser.password);
      const isValidPassword = await bcrypt.compare(baseUser.password, found.password);
      expect(isValidPassword).toBe(true);
    });

    test('should prevent duplicate email registration', async () => {
      await userServices.addUser(baseUser);

      await expect(userServices.addUser(baseUser)).rejects.toThrow(
        'Email already registered'
      );
    });

    test('should format location correctly when creating user', async () => {
      const user = await userServices.addUser(baseUser);
      const found = await userModel.findById(user._id);

      expect(found.location.type).toBe('Point');
      expect(found.location.coordinates).toEqual([-118.123, 34.123]); // [lng, lat]
    });

    test('should create user without location if not provided', async () => {
      const userWithoutLocation = {
        name: 'No Location User',
        email: 'nolocation@example.com',
        password: 'password123',
      };

      const user = await userServices.addUser(userWithoutLocation);
      expect(user.name).toBe('No Location User');
    });

    test('should return all users', async () => {
      await userServices.addUser(baseUser);
      await userServices.addUser({
        ...baseUser,
        email: 'second@example.com',
        name: 'Jane',
      });

      const users = await userServices.getUsers();
      expect(users.length).toBe(2);
    });

    test('should find a user by ID', async () => {
      const user = await userServices.addUser(baseUser);

      const found = await userServices.findUserById(user._id);
      expect(found.email).toBe('john@example.com');
    });

    test('should update a user', async () => {
      const user = await userServices.addUser(baseUser);

      const updated = await userServices.updateUser(user._id, {
        name: 'Updated Name',
      });
      expect(updated.name).toBe('Updated Name');
    });

    test('should delete a user', async () => {
      const user = await userServices.addUser(baseUser);

      const deleted = await userServices.deleteUser(user._id);
      expect(deleted._id.toString()).toBe(user._id.toString());

      const shouldBeGone = await userModel.findById(user._id);
      expect(shouldBeGone).toBeNull();
    });
  });

  describe('User Search Operations', () => {
    test('should find users by name (case insensitive)', async () => {
      await userServices.addUser(baseUser);

      const results = await userServices.findUserByName('john');
      expect(results.length).toBe(1);
    });

    test('should find user by email', async () => {
      await userServices.addUser(baseUser);

      const result = await userServices.findUserByEmail('john@example.com');
      expect(result).not.toBeNull();
      expect(result.email).toBe('john@example.com');
    });

    test('should find user by email (case insensitive)', async () => {
      await userServices.addUser(baseUser);

      const result = await userServices.findUserByEmail('JOHN@EXAMPLE.COM');
      expect(result).not.toBeNull();
      expect(result.email).toBe('john@example.com');
    });

    test('should find users by phone number', async () => {
      await userServices.addUser(baseUser);

      const results = await userServices.findUserByPhoneNumber('555-1234');
      expect(results.length).toBe(1);
    });

    test('should find users by gender', async () => {
      await userServices.addUser(baseUser);

      const results = await userServices.findUserByGender('Male');
      expect(results.length).toBe(1);
    });

    test('should find users by interests', async () => {
      await userServices.addUser(baseUser);

      const results = await userServices.findUserByInterests(['music']);
      expect(results.length).toBe(1);
    });

    test('should find users within geographic radius', async () => {
      await userServices.addUser(baseUser);

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

    test('should find users by exact date of birth', async () => {
      await userServices.addUser(baseUser);

      const results = await userServices.findUserByDateOfBirth(
        new Date('1994-06-15')
      );
      expect(results.length).toBe(1);
    });

    test('should calculate age correctly', async () => {
      const dob = new Date('1994-06-15');
      const age = userServices.calculateAge(dob);
      
      const currentYear = new Date().getFullYear();
      const expectedAge = currentYear - 1994;
      
      // Age could be expectedAge or expectedAge - 1 depending on current date
      expect(age).toBeGreaterThanOrEqual(expectedAge - 1);
      expect(age).toBeLessThanOrEqual(expectedAge);
    });

    test('should find users by age', async () => {
      const currentYear = new Date().getFullYear();
      const userAge25 = {
        ...baseUser,
        email: 'age25@example.com',
        dateOfBirth: new Date(`${currentYear - 25}-06-15`),
      };
      await userServices.addUser(userAge25);

      const results = await userServices.findUserByAge(25);
      expect(results.length).toBeGreaterThan(0);
    });
  });
});