import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserLoginSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { collection: 'users_login_list' }
);

// Hash password before saving
UserLoginSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password for login
UserLoginSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const UserLogin = mongoose.model('UserLogin', UserLoginSchema);

export default UserLogin;
