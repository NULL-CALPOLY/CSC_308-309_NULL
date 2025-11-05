import loginModel from './LoginSchema.js';

// Get all login credentials
function getLogins() {
  return loginModel.find();
}

// Add login credentials
function addLogin(login) {
  const newLogin = new loginModel(login);
  return newLogin.save();
}

// Delete login credentials
function deleteLogin(id) {
  return loginModel.findByIdAndDelete(id);
}

// Update login credentials
function updateLogin(id, loginData) {
  return loginModel.findByIdAndUpdate(id, loginData, {
    new: true,
    runValidators: true,
  });
}

// Find login by email
function findLoginByEmail(email) {
  return loginModel.findOne({ email: email });
}

// Find login by password
function findLoginByPassword(password) {
  return loginModel.find({ password: password });
}

// Find login by ID
function findLoginById(id) {
  return loginModel.findById(id);
}

// Find login by email and password
function findLoginByEmailAndPassword(email, password) {
  return loginModel.findOne({ email: email, password: password });
}

export default {
  getLogins,
  addLogin,
  deleteLogin,
  updateLogin,
  findLoginByEmail,
  findLoginByPassword,
  findLoginById,
  findLoginByEmailAndPassword,
};
