import mongoose from 'mongoose';
import MessageSchema from './Message.js';

const CommentsSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Event',
    },
    messages: {
      type: [MessageSchema],
      required: true,
      default: [],
    },
  },
  { collection: 'comments' }
);

const Comments = mongoose.model('Comments', CommentsSchema);
export default Comments;
