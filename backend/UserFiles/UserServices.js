import userModel from './UserSchema.js';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { isAdminEmail } from '../utils/adminEmail.js';
import {
  createEmailLookupHash,
  isEncryptedEmail,
  normalizeEmail,
} from './EmailCrypto.js';
import { isEmailVerificationRequired } from '../utils/emailVerification.js';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

const BCRYPT_HASH_PREFIX = /^\$2[aby]\$/;
const ARGON2ID_HASH_PREFIX = /^\$argon2id\$/;

/*
 * Helper functions for authentication
 */

// Verify legacy bcrypt passwords and migrate them after a successful login.
export async function comparePassword(user, password) {
  if (!user.password) return false;

  try {
    if (ARGON2ID_HASH_PREFIX.test(user.password)) {
      const isValid = await argon2.verify(user.password, password);

      if (isValid && argon2.needsRehash(user.password, ARGON2_OPTIONS)) {
        user.password = password;
        await user.save();
      }

      return isValid;
    }

    if (BCRYPT_HASH_PREFIX.test(user.password)) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return false;

      user.password = password;
      await user.save();
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

function migrateLegacyEmail(user, canonicalEmail) {
  if (isEncryptedEmail(user.email)) return false;

  user.email = canonicalEmail;
  user.markModified('email');
  return true;
}

export async function findUserByCanonicalEmail(email, selection) {
  const canonicalEmail = normalizeEmail(email);
  const emailLookupHash = createEmailLookupHash(canonicalEmail);
  const encryptedQuery = userModel.findOne({ emailLookupHash });
  if (selection) encryptedQuery.select(selection);

  const encryptedUser = await encryptedQuery;
  if (encryptedUser) return encryptedUser;

  // Temporary compatibility path for pre-encryption records.
  const legacyQuery = userModel.findOne({
    email: canonicalEmail,
    emailLookupHash: { $exists: false },
  });
  if (selection) legacyQuery.select(selection);
  return legacyQuery;
}

/**
 * Authenticate a user and return access + refresh tokens
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object, accessToken: string, refreshToken: string} | null>}
 */
async function authenticateUser(email, password) {
  const canonicalEmail = normalizeEmail(email);
  const user = await findUserByCanonicalEmail(canonicalEmail);
  if (!user || !user.password) return null;

  const isValid = await comparePassword(user, password);
  if (!isValid) return null;

  const emailMigrated = migrateLegacyEmail(user, canonicalEmail);
  const admin = isAdminEmail(canonicalEmail);
  const adminChanged = user.isAdmin !== admin;
  const verificationBypassed =
    !isEmailVerificationRequired() && !user.emailVerified;

  if (adminChanged) user.isAdmin = admin;
  if (verificationBypassed) user.emailVerified = true;
  if (emailMigrated || adminChanged || verificationBypassed) await user.save();

  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { user, accessToken, refreshToken };
}

// Get all users
function getUsers() {
  return userModel.find();
}

function createEmailAlreadyRegisteredError() {
  const error = new Error('Email already registered');
  error.status = 409;
  return error;
}

function isEmailLookupConflict(error) {
  return error?.code === 11000 && error.keyPattern?.emailLookupHash;
}

// Add a user and create a short-lived email-verification token when required.
async function addUser(user) {
  const existingUser = await findUserByCanonicalEmail(user.email);
  if (existingUser) throw createEmailAlreadyRegisteredError();

  const verificationRequired = isEmailVerificationRequired();
  const formattedUser = formatUser(user);
  formattedUser.isVerifiedStudent = false;
  formattedUser.isAdmin = isAdminEmail(user.email);
  formattedUser.emailVerified = !verificationRequired;

  const verificationToken = verificationRequired
    ? crypto.randomBytes(32).toString('hex')
    : null;
  formattedUser.emailVerificationToken = verificationToken;
  formattedUser.emailVerificationExpires = verificationRequired
    ? new Date(Date.now() + 24 * 60 * 60 * 1000)
    : null;

  try {
    const savedUser = await new userModel(formattedUser).save();
    return { user: savedUser, verificationToken, verificationRequired };
  } catch (error) {
    if (isEmailLookupConflict(error)) throw createEmailAlreadyRegisteredError();
    throw error;
  }
}

async function verifyEmail(token) {
  const user = await userModel
    .findOne({ emailVerificationToken: token })
    .select('+emailVerificationToken');

  if (!user || user.emailVerificationExpires < new Date()) {
    const error = new Error('Invalid or expired verification link.');
    error.status = 400;
    throw error;
  }

  user.emailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();
  return user;
}

async function resendVerification(email) {
  const user = await findUserByCanonicalEmail(email, '+emailVerificationToken');
  if (!user || user.emailVerified) return null;

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();
  return { user, verificationToken };
}

// Delete a user
function deleteUser(id) {
  return userModel.findByIdAndDelete(id);
}

// Update a user while preserving server-controlled fields and schema hooks.
async function updateUser(id, userData) {
  const {
    isVerifiedStudent,
    isAdmin,
    googleId,
    password,
    blockedUsers,
    emailVerified,
    emailVerificationToken,
    emailVerificationExpires,
    emailLookupHash,
    _id,
    ...safeData
  } = userData || {};

  const user = await userModel.findById(id);
  if (!user) return null;

  user.set(formatUser(safeData));

  try {
    return await user.save();
  } catch (error) {
    if (isEmailLookupConflict(error)) throw createEmailAlreadyRegisteredError();
    throw error;
  }
}

// Search users by various criteria
function findUserById(id) {
  return userModel.findById(id);
}

// Public-safe projection of a user. Excludes email, phone, date of birth,
// gender, location, and third-party identity fields.
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
  return findUserByCanonicalEmail(email);
}

// Find user by email (for login)
function findUserByEmailForAuth(email) {
  return findUserByCanonicalEmail(email);
}

function findUserByPhoneNumber(phoneNumber) {
  return userModel.find({ phoneNumber });
}

function findUserByDateOfBirth(dob) {
  const startDate = new Date(dob);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(dob);
  endDate.setUTCHours(23, 59, 59, 999);

  return userModel.find({ dateOfBirth: { $gte: startDate, $lt: endDate } });
}

function findUserByGender(gender) {
  return userModel.find({ gender });
}

function findUserByInterests(interests) {
  return userModel.find({ interests: { $in: interests } });
}

function findUserByCity(city) {
  return userModel.find({ city });
}

function findUserByLocation(latitude, longitude, radiusInMiles) {
  return userModel.find({
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radiusInMiles / 3959],
      },
    },
  });
}

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

function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
  return age;
}

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

async function getBlockedUsers(blockerId) {
  const user = await userModel.findById(blockerId).select('blockedUsers');
  return user?.blockedUsers || [];
}

async function hasBlocked(ownerId, viewerId) {
  if (!ownerId || !viewerId) return false;
  const owner = await userModel.findById(ownerId).select('blockedUsers');
  return (owner?.blockedUsers || []).some((blockedUserId) => {
    return String(blockedUserId) === String(viewerId);
  });
}

async function findUserIdsWhoBlocked(viewerId) {
  if (!viewerId) return [];
  const users = await userModel.find({ blockedUsers: viewerId }).select('_id');
  return users.map((user) => user._id);
}

export default {
  authenticateUser,
  getUsers,
  verifyEmail,
  resendVerification,
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
