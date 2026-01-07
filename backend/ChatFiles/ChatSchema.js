import mongoose from 'mongoose';

const GroupChatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    members: {
      type: [{ type: mongoose.Schema.Types.ObjectId }], // User Schema
      required: true,
    },
    events: {
      type: [{ type: mongoose.Schema.Types.ObjectId }], // Event Schema
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
