import mongoose from 'mongoose';
import UserSchema from 'User.js';

const UserSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      trim: true,
      enum: ['Male', 'Female', 'Other', 'Do not want to Disclose'],
    },
    interests: {
      type: [String],
      required: false,
    },
    radius: {
      type: Number,
      required: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
  },
  { collection: 'users_list' }
);

const User = mongoose.model('User', UserSchema);

export default User;
