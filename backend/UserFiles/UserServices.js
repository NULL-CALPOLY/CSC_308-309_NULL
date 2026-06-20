import userModel from './UserSchema.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { isAdminEmail } from '../utils/adminEmail.js';

/*
 * Helper functions for authentication
 */

// Compare password for a user
export async function comparePassword(user, password) {
  if (!user.password) return false;
  return bcrypt.compare(password, user.password);
}

/**
 * Authenticate a user and return access + refresh tokens
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object, accessToken: string, refreshToken: string} | null>}
 */
async function authenticateUser(email, password) {
  const user = await userModel.findOne({ email: email.toLowerCase() });
  if (!user || !user.password) return null;

  const isValid = await comparePassword(user, password);
  if (!isValid) return null;

  // Keep admin status in sync (config-driven). Verified-student is intentionally
  // NOT changed here — it's only granted via Google-authenticated student
  // accounts, and a password login shouldn't revoke a previously verified badge.
  const admin = isAdminEmail(user.email);
  if (user.isAdmin !== admin) {
    user.isAdmin = admin;
    await user.save();
  }

  // Generate access token (short-lived)
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: '15m',
  });

  // Generate refresh token (long-lived)
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '7d',
    }
  );

  return { user, accessToken, refreshToken };
}

// Get all users
function getUsers() {
  return userModel.find();
}

// Add a user
async function addUser(user) {
  // Check if email already exists
  const existingUser = await userModel.findOne({ email: user.email });

  if (existingUser) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }
  const formatteduser = formatUser(user);
  // Verified-student status is NOT granted from a self-typed email at password
  // signup (anyone could type @calpoly.edu). It's only granted when Google has
  // actually authenticated a student-domain account (see GoogleAuthRoutes).
  formatteduser.isVerifiedStudent = false;
  formatteduser.isAdmin = isAdminEmail(user.email);
  const newUser = new userModel(formatteduser);
  return await newUser.save();
}

// Delete a user
function deleteUser(id) {
  return userModel.findByIdAndDelete(id);
}

// Update a user
function updateUser(id, userData) {
  // Strip server-controlled fields so a client can't self-grant them via PUT.
  const {
    isVerifiedStudent,
    isAdmin,
    googleId,
    password,
    blockedUsers,
    _id,
    ...safeData
  } = userData || {};
  return userModel.findByIdAndUpdate(id, safeData, {
    new: true,
    runValidators: true,
  });
}

// Search users by various criteria
function findUserById(id) {
  return userModel.findById(id);
}

// Public-safe projection of a user — only fields safe to expose on a public
// profile page. Excludes email, phone, dateOfBirth, gender, location, googleId.
function findPublicProfileById(id) {
  return userModel
    .findById(id)
    .select('name avatar bio interests city createdAt isVerifiedStudent');
}

// Search users by name
function findUserByName(name) {
  return userModel.find({ name: { $regex: name, $options: 'i' } });
}

// Search users by email
function findUserByEmail(email) {
  return userModel.findOne({ email: email.toLowerCase() });
}

// Find user by email (for login)
function findUserByEmailForAuth(email) {
  return userModel.findOne({ email: email.toLowerCase() });
}

// Search users by phone number
function findUserByPhoneNumber(phoneNumber) {
  return userModel.find({ phoneNumber: phoneNumber });
}

// Search users by date of birth
function findUserByDateOfBirth(dob) {
  // Match users with the same date (ignoring time)
  const startDate = new Date(dob);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(dob);
  endDate.setUTCHours(23, 59, 59, 999);

  return userModel.find({
    dateOfBirth: {
      $gte: startDate,
      $lt: endDate,
    },
  });
}

// Search user by gender
function findUserByGender(gender) {
  return userModel.find({ gender: gender });
}

// Search users by itnerests
function findUserByInterests(interests) {
  return userModel.find({ interests: { $in: interests } });
}

// Search users by city
function findUserByCity(city) {
  return userModel.find({ city: city });
}

// Search users by location (latitude, longitude) within a radius (in miles)
function findUserByLocation(latitude, longitude, radiusInMiles) {
  return userModel.find({
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radiusInMiles / 3959],
      },
    },
  });
}

// Search users by radius
function findUserByRadius(radiusInMiles) {
  return userModel.find({ radius: radiusInMiles });
}

function formatUser(user) {
  if (!user.location) return user;

  const { latitude, longitude } = user.location;

  return {
    ...user,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
  };
}

// Calculate age from date of birth (helper function)
function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--; // birthday has not occurred yet this year
  }

  return age;
}

// Search users by age
function findUserByAge(age) {
  const now = new Date();
  const birthYear = now.getFullYear() - age;
  const startOfYear = new Date(birthYear, 0, 1, 0, 0, 0, 0);
  const endOfYear = new Date(birthYear, 11, 31, 23, 59, 59, 999);
  return userModel.find({
    dateOfBirth: { $gte: startOfYear, $lte: endOfYear },
  });
}

// ── Blocking ──

// Add targetId to blockerId's block list.
function blockUser(blockerId, targetId) {
  return userModel.findByIdAndUpdate(
    blockerId,
    { $addToSet: { blockedUsers: targetId } },
    { new: true }
  );
}

function unblockUser(blockerId, targetId) {
  return userModel.findByIdAndUpdate(
    blockerId,
    { $pull: { blockedUsers: targetId } },
    { new: true }
  );
}

// Returns the blocker's block list (array of user ids).
async function getBlockedUsers(blockerId) {
  const user = await userModel.findById(blockerId).select('blockedUsers');
  return user?.blockedUsers || [];
}

// True if `ownerId` has blocked `viewerId`.
async function hasBlocked(ownerId, viewerId) {
  if (!ownerId || !viewerId) return false;
  const owner = await userModel.findById(ownerId).select('blockedUsers');
  return (owner?.blockedUsers || []).some((b) => String(b) === String(viewerId));
}

// Returns the ids of all users who have blocked `viewerId` (so their content
// can be filtered out of list/feed responses).
async function findUserIdsWhoBlocked(viewerId) {
  if (!viewerId) return [];
  const users = await userModel
    .find({ blockedUsers: viewerId })
    .select('_id');
  return users.map((u) => u._id);
}

export default {
  authenticateUser,
  getUsers,
  findUserById,
  findPublicProfileById,
  blockUser,
  unblockUser,
  getBlockedUsers,
  hasBlocked,
  findUserIdsWhoBlocked,
  findUserByName,
  findUserByEmail,
  findUserByPhoneNumber,
  findUserByDateOfBirth,
  findUserByGender,
  findUserByInterests,
  findUserByCity,
  findUserByLocation,
  addUser,
  deleteUser,
  updateUser,
  findUserByRadius,
  calculateAge,
  findUserByAge,
  findUserByEmailForAuth,
};
