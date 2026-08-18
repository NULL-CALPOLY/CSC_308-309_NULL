import mongoose from 'mongoose';
import argon2 from 'argon2';
import {
  createEmailLookupHash,
  decryptEmail,
  encryptEmail,
  isEncryptedEmail,
  normalizeEmail,
} from './EmailCrypto.js';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    emailLookupHash: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    password: {
      type: String,
      required: false, // Made optional for OAuth users
      trim: true,
    },
    avatar: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    avatarPublicId: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      required: false,
      trim: true,
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    bio: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
    },
    // True when the account's email is on the recognized student domain
    // (e.g. @calpoly.edu). Drives the "Verified Student" badge and unlocks
    // student-/club-only events. Derived from email, never set by the client.
    isVerifiedStudent: {
      type: Boolean,
      default: false,
    },
    // Master/site administrator — can approve or reject club registrations.
    // Server-controlled (derived from ADMIN_EMAILS), never set by the client.
    isAdmin: {
      type: Boolean,
      default: false,
    },
    interests: {
      type: [{ type: String }],
      required: false,
    },
    // Users this account has blocked. A blocked user cannot see this account's
    // profile or events.
    blockedUsers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    // Email verification — defaults to true for existing users / OAuth users.
    // Password-signup flow sets this false until the user clicks the email link.
    emailVerified: {
      type: Boolean,
      default: true,
    },
    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
      },
    },
  },
  { collection: 'users_list', timestamps: true }
);

// Geospatial index for "users near me" radius queries. Partial so users without
// coordinates (e.g. OAuth signups, or anyone who hasn't set a location) aren't
// indexed. The schema defaults `location.type` to 'Point', so a location-less
// user still persists `location: { type: 'Point' }` with no coordinates — a
// non-partial 2dsphere index errors on that with "Can't extract geo keys".
UserSchema.index(
  { location: '2dsphere' },
  { partialFilterExpression: { 'location.coordinates': { $exists: true } } }
);

UserSchema.pre('validate', function (next) {
  if (!this.isModified('email') || !this.email) return next();

  try {
    const normalizedEmail = normalizeEmail(this.email);
    this.email = encryptEmail(normalizedEmail);
    this.emailLookupHash = createEmailLookupHash(normalizedEmail);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    this.password = await argon2.hash(this.password, ARGON2_OPTIONS);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password;
    delete ret.emailLookupHash;
    if (isEncryptedEmail(ret.email)) ret.email = decryptEmail(ret.email);
    return ret;
  },
});

const User = mongoose.model('User', UserSchema);

export default User;
