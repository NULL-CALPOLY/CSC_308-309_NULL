import userModel from './UserSchema.js';

// Get all users
function getUsers() {
  return userModel.find();
}

// Add a user
async function addUser(user) {
  // Check if email already exists
  const existingUser = await userModel.findOne({ email: user.email });
  console.log(existingUser);

  if (existingUser) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }
  const formatteduser = formatUser(user);
  const newUser = new userModel(formatteduser);
  return await newUser.save();
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

// Search users by name
function findUserByName(name) {
  return userModel.find({ name: { $regex: name, $options: 'i' } });
}

// Search users by email
function findUserByEmail(email) {
  return userModel.find({ email: email });
}

// Search users by phone number
function findUserByPhoneNumber(phoneNumber) {
  return userModel.find({ phoneNumber: phoneNumber });
}

// Search users by date of birth
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

// Search user by gender
function findUserByGender(gender) {
  return userModel.find({ gender: gender });
}

// Search users by itnerests
function findUserByInterests(interests) {
  return userModel.find({ interests: { $in: interests } });
}

// Search users by city
function findUserByCity(city) {
  return userModel.find({ city: city });
}

// Search users by location (latitude, longitude) within a radius (in miles)
function findUserByLocation(latitude, longitude, radiusInMiles) {
  return userModel.find({
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radiusInMiles / 3959],
      },
    },
  });
}

// Search users by radius
function findUserByRadius(radiusInMiles) {
  return userModel.find({ radius: radiusInMiles });
}

function formatUser(user) {
  return {
    ...user,
    location: {
      type: 'Point',
      coordinates: [user.location.longitude, user.location.latitude],
    },
  };
}


// Calculate age from date of birth (helper function)
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

// Search users by age
function findUserByAge(age) {
  const now = new Date();
  const birthYear = now.getFullYear() - age;
  const startOfYear = new Date(birthYear, 0, 1, 0, 0, 0, 0);
  const endOfYear = new Date(birthYear, 11, 31, 23, 59, 59, 999);
  return userModel.find({
    dateOfBirth: { $gte: startOfYear, $lte: endOfYear },
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
