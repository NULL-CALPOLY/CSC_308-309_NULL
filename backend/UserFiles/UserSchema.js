import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
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
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
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
