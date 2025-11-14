import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
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
    mapComponent: {
      type: String,
      required: true,
    },
    attendees: {
      type: [mongoose.Schema.Types.ObjectId], // ALL USERIDS MUST BE VALID
      required: false,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    blockedUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      required: false,
    },
    comment: {
      type: [{ type: String }],
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
    interests: {
      type: [String],
      required: true,
    },
    time: {
      start: {
        type: Number, // e.g., 0930 or 1545
        required: true,
        min: 0,
        max: 2359,
      },
      end: {
        type: Number,
        required: true,
        min: 0,
        max: 2359,
      },
    },
  },
  { collection: 'events_list' }
);

const Event = mongoose.model('Event', EventSchema);

export default Event;
