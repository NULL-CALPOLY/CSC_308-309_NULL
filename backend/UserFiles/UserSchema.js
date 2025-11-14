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
    homeTown: {
      type: String,
      required: false,
      trim: true,
    },
    interests: {
      type: [String],
      required: false,
    },
    },
  { collection: 'users_list' }
);

const User = mongoose.model('User', UserSchema);

export default User;
