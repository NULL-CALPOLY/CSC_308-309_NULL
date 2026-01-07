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
    DOB: {
      type: Date,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    interests: {
      type: [String],
      required: false,
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
