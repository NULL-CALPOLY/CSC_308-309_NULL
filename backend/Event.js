import mongoose from 'mongoose';
import UserSchema from 'User.js';

<<<<<<< HEAD
const EventSchema = new mongoose.Schema(
    {
        eventName : {
            type: String,
            required: true,
            trim: true
        },
        description : {
              type: String,
              required: true,
              trim: true
        },
        mapComponent : {
               type: String,
               required: true,
        },
        attendees : {
               type: UserSchema,
               required: false,
        },
        Host : {
               type: UserSchema,
               required: true,
        },
        blockedUsers : {
            type: [UserSchema],
            required : false,
        },
        comment : {
             type: [{ type: String }],
             required : true,
        },
        location : {
              latitude: {
                  type: Number,
                  required: true
              },
              longitude: {
                  type: Number,
                  required: true
              },
        },
    },
    { collection : "events_list" }
);

const Event = mongoose.model("Event", EventSchema);
=======
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
>>>>>>> main

export default Event;
