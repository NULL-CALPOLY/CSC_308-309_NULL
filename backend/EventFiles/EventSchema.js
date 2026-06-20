import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    name: {
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
      type: [{ type: mongoose.Schema.Types.ObjectId }], // ALL USERIDS MUST BE VALID
      required: false,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    blockedUsers: {
      type: [{ type: mongoose.Schema.Types.ObjectId }],
      required: false,
    },
    comments: {
      type: [{ type: mongoose.Schema.Types.ObjectId }],
      required: true,
    },
    address: {
      type: String,
      required: true,
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
    interests: {
      type: [{ type: String }],
      required: true,
    },
    time: {
      start: {
        // Year, Month (0-11), Day, Hours, Minutes
        type: Date,
        required: true,
      },
      end: {
        // Year, Month (0-11), Day, Hours, Minutes
        type: Date,
        required: true,
      },
    },
  },
  { collection: 'events_list', timestamps: true }
);

// Geospatial index for efficient "events near me" queries ($near / $geoWithin).
// Without this, location queries do a full collection scan and won't scale.
EventSchema.index({ location: '2dsphere' });

// Supports the per-host daily creation cap and "my events" lookups.
EventSchema.index({ host: 1, createdAt: -1 });

const Event = mongoose.model('Event', EventSchema);

export default Event;
