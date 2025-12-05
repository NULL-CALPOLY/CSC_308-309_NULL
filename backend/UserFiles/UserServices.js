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

function findUserByDateOfBirth(dob) {
  return userModel.find({ dob: dob });
}

function findUserByGender(gender) {
  return userModel.find({ gender: gender });
}

function findUserByInterests(interests) {
  return userModel.find({ interests: { $in: interests } });
}

function findUserByCity(city) {
  return userModel.find({ city: city });
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

function findUserByRadius(radiusInMiles) {
  return userModel.find({ radius: radiusInMiles });
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
  findUserByCity,
  findUserByLocation,
  addUser,
  deleteUser,
  updateUser,
  findUserByRadius,
  findUserByAge,
};
