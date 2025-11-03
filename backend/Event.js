import mongoose from "mongoose";
import UserSchema from "User.js";

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

export default Event;
