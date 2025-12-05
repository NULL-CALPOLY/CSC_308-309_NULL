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
  return userModel.find({ name: { $regex: name, $options: 'i' } });
}

function findUserByEmail(email) {
  return userModel.find({ email: email });
}

function findUserByPhoneNumber(phoneNumber) {
  return userModel.find({ phoneNumber: phoneNumber });
}

function findUserByAge(age) {
  return userModel.find({ age: age });
}

function findUserByGender(gender) {
  return userModel.find({ gender: gender });
}

function findUserByInterests(interests) {
  return userModel.find({ interests: { $in: interests } });
}

function findUserByRadius(radius) {
  return userModel.find({ radius: radius });
}

function findUserByLocation(latitude, longitude, radiusInMiles) {
  return userModel.find({
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radiusInMiles / 3959],
      },
    },
  });
}

export default {
  getUsers,
  findUserById,
  findUserByName,
  findUserByEmail,
  findUserByPhoneNumber,
  findUserByAge,
  findUserByGender,
  findUserByInterests,
  findUserByRadius,
  findUserByLocation,
  addUser,
  deleteUser,
  updateUser,
};
