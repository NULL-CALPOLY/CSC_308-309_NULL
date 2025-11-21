import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name : {
            type: String,
            required: true,
            trim: true
        },
        email : {
              type: String,
              required: true,
              trim: true
        },
        phoneNumber : {
               type: String,
               required: true,
               trim: true
        },
        dateOfBirth: {
                type: String,
                required: true,
                trim: true
        },
        gender: {
                type: String,
                required: true,
                trim: true
        },
        interests : {
            type: [{ type: String }],
            required : false,
        },
        city : {
             type: String,
             required : true,
             trim: true
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
        }
    },
    { collection : "users_list" }
);

const User = mongoose.model("User", UserSchema);

export default User;
