// basically stolen from backend assignment

import userModel from './UserSchema.js';

// Get all users
function getUsers() {
  return userModel.find();
}

// Add a user
function addUser(user) {
  const newUser = new userModel(user);
  return newUser.save();
}

// Delete a user
function deleteUser(id) {
  return userModel.findByIdAndDelete(id);
}

// Update a user
function updateUser(id, userData) {
  return userModel.findByIdAndUpdate(id, userData, {
    new: true,
    runValidators: true,
  });
}

// Search users by various criteria
function findUserById(id) {
  return userModel.findById(id);
}

function findUserByName(name) {
  return userModel.find({ name: name });
}

function findUserByEmail(email) {
  return userModel.find({ email: email });
}

function findUserByPhoneNumber(phoneNumber) {
  return userModel.find({ phoneNumber: phoneNumber });
}

function findUserByDateOfBirth(dateOfBirth) {
  return userModel.find({ dateOfBirth: dateOfBirth });
}

function findUserByGender(gender) {
  return userModel.find({ gender: gender });
}

function findUserByInterests(interests) {
  return userModel.find({ interests: { $in: interests } });
}

function findUserByHomeTown(homeTown) {
  return userModel.find({ homeTown: homeTown });
}

export default {
  getUsers,
  findUserById,
  findUserByName,
  findUserByEmail,
  findUserByPhoneNumber,
  findUserByDateOfBirth,
  findUserByGender,
  findUserByInterests,
  findUserByHomeTown,
  addUser,
  deleteUser,
  updateUser,
};
