import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
    },
    DOB: {
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
  { collection: 'users_list' }
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
