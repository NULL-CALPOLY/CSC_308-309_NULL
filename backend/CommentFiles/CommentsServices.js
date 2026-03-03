import commentsModel from './CommentsSchema.js';

// Get comments by event
function getCommentsByEvent(eventId) {
  return commentsModel.findOne({ eventId });
}

// Create comments thread for an event
function createComments(eventId) {
  const comments = new commentsModel({ eventId });
  return comments.save();
}

// Add message to comments
function addMessage(eventId, name, message) {
  const messageData = { name, message };
  return commentsModel.findOneAndUpdate(
    { eventId },
    { $push: { messages: messageData } },
    { new: true, runValidators: true }
  );
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
