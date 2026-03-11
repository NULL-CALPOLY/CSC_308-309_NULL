import commentsModel from './CommentsSchema.js';

// Get comments by event
function getCommentsByEvent(eventId) {
  return commentsModel
    .findOne({ eventId })
    .populate('messages.userId', 'avatar name');
}

// Create comments thread for an event
function createComments(eventId) {
  const comments = new commentsModel({ eventId });
  return comments.save();
}

// Add message to comments
function addMessage(eventId, name, message, avatar, userId) {
  const messageData = {
    name,
    message,
    avatar: avatar || null,
    userId: userId || null,
  };
  return commentsModel
    .findOneAndUpdate(
      { eventId },
      { $push: { messages: messageData } },
      { new: true, runValidators: true }
    )
    .populate('messages.userId', 'avatar name');
}

// Delete all comments for an event
function deleteCommentsByEvent(eventId) {
  return commentsModel.findOneAndDelete({ eventId });
}

export default {
  getCommentsByEvent,
  createComments,
  addMessage,
  deleteCommentsByEvent,
};
