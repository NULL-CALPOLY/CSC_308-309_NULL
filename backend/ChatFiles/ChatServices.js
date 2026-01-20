import chatModel from './ChatSchema.js';

// Get all group chats
function getChats() {
  return chatModel.find().populate('members events');
}

// Add a new group chat
function addChat(Chat) {
  const newChat = new chatModel(Chat);
  return newChat.save();
}

// Delete a group chat by ID
function deleteChat(id) {
  return chatModel.findByIdAndDelete(id);
}

// Update a group chat by ID
function updateChat(id, data) {
  return chatModel
    .findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
    .populate('members events');
}

// Find group chat by ID
function findChatById(id) {
  return chatModel.findById(id).populate('members events');
}

// Find group chats by group name
function findChatByName(name) {
  return chatModel
    .find({
      name: { $regex: name, $options: 'i' },
    })
    .populate('members events');
}

// Find group chats in a specific city
function findChatsByCity(city) {
  return chatModel.find({ city: city }).populate('members events');
}

// Find group chats that include a specific member
function findChatsByUserID(userId) {
  return chatModel
    .find({
      members: userId,
    })
    .populate('members events');
}

// Find group chats containing any of the given interests
function findChatsByInterests(interests) {
  return chatModel
    .find({
      interests: { $in: interests },
    })
    .populate('members events');
}

// Find group chats containing a specific event
function findChatsByEvent(eventId) {
  return chatModel
    .find({
      events: eventId,
    })
    .populate('members events');
}

// Add a member to a group chat
function addUserToChat(groupId, userId) {
  return chatModel
    .findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    )
    .populate('members events');
}

// Remove a member from a group chat
function removeUserFromChat(groupId, userId) {
  return chatModel
    .findByIdAndUpdate(groupId, { $pull: { members: userId } }, { new: true })
    .populate('members events');
}

// Add an event to a group chat
function addEventToChat(groupId, eventId) {
  return chatModel
    .findByIdAndUpdate(
      groupId,
      { $addToSet: { events: eventId } },
      { new: true }
    )
    .populate('members events');
}

// Remove an event from a group chat
function removeEventFromChat(groupId, eventId) {
  return chatModel
    .findByIdAndUpdate(groupId, { $pull: { events: eventId } }, { new: true })
    .populate('members events');
}

export default {
  getChats,
  addChat,
  deleteChat,
  updateChat,
  findChatById,
  findChatByName,
  findChatsByCity,
  findChatsByUserID,
  findChatsByInterests,
  findChatsByEvent,
  addUserToChat,
  removeUserFromChat,
  addEventToChat,
  removeEventFromChat,
};
