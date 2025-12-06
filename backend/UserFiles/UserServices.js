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
  // Match users with the same date (ignoring time)
  const startDate = new Date(dob);
  startDate.setUTCHours(0, 0, 0, 0);
  
  const endDate = new Date(dob);
  endDate.setUTCHours(23, 59, 59, 999);
  
  return userModel.find({
    dateOfBirth: {
      $gte: startDate,
      $lt: endDate,
    },
  });
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

function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--; // birthday has not occurred yet this year
  }

  return age;
}

function findUserByAge(age) {
  // Find all users and filter by calculated age
  return userModel.find().then(users => {
    return users.filter(user => calculateAge(user.dateOfBirth) === age);
  });
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
  calculateAge,
  findUserByAge,
};
