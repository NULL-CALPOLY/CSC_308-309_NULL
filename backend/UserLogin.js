import mongoose from "mongoose";

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
  { collection: "users_login_list" }
);

const UserLogin = mongoose.model("UserLogin", UserLoginSchema);

export default UserLogin;
