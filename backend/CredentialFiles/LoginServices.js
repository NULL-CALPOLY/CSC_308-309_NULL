import loginModel from './LoginSchema.js';
import jwt from 'jsonwebtoken';

function generateAccessToken(username) {
  console.log(process.env.TOKEN_SECRET, 'secret token');
  return jwt.sign({ username: username }, process.env.TOKEN_SECRET, {
    expiresIn: "600s",
  });
}

// Get all login credentials
function getLogins() {
  return loginModel.find();
}

// Add login credentials
function addLogin(login) {
  const newLogin = new loginModel(login);
  const email = login.email;
  const token = generateAccessToken(email);
  return { token, newLogin: newLogin.save() };
}

// Delete login credentials
function deleteLogin(id) {
  return loginModel.findByIdAndDelete(id);
}

// Update login, will auto rehash if password is included
async function updateLogin(id, loginData) {
  const user = await loginModel.findById(id);
  if (!user) return null;

  if (loginData.email) user.email = loginData.email;
  if (loginData.password) user.password = loginData.password;

  return user.save();
}

// Find login by email
function findLoginByEmail(email) {
  return loginModel.findOne({ email: email });
}

// Find login by ID
function findLoginById(id) {
  return loginModel.findById(id);
}

// Login (email + password compare)
async function authenticate(email, password) {
  const user = await loginModel.findOne({ email });
  if (!user) return null;

  const match = await user.comparePassword(password);
  if (match) {
    const token = generateAccessToken(email);
    user.token = token;
    return { user, token };
  } else {
    return null;
  }
}

export default {
  getLogins,
  addLogin,
  deleteLogin,
  updateLogin,
  findLoginByEmail,
  findLoginById,
  authenticate,
};
