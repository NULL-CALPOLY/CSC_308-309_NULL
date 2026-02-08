import mongoose from 'mongoose';

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
    interests: {
      type: [{ type: String }],
      required: false,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [{ type: Number }], // [longitude, latitude]
        required: true,
      },
    },
    radius: {
      type: Number,
      required: false,
    },
  },
  { collection: 'users_list' }
);

const User = mongoose.model('User', UserSchema);

export default User;
