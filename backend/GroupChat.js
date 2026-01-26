import mongoose from 'mongoose';
import UserSchema from 'User';
import EventSchema from 'Event';

const GroupChatSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
    },
    members: {
      type: [UserSchema],
      required: true,
    },
    events: {
      type: [EventSchema],
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },

    interests: {
      type: [{ type: String }],
      required: false,
    },
  },
  { collection: 'group_chat_list' }
);

const GroupChat = mongoose.model('GroupChat', GroupChatSchema);

export default GroupChat;
