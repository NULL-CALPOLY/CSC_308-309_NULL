import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
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
    interests: {
      type: [{ type: String }],
      required: false,
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

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model('User', UserSchema);

export default User;
