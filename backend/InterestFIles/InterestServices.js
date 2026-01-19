import interestModel from './InterestSchema.js';

function getUsers() {
  return interestModel.find();
}

function addInterest(interest) {
  const newInterest = new interestModel(interest);
  return newInterest.save();
}

function deleteInterest(id) {
  return interestModel.findByIdAndDelete(id);
}

function updateInterest(id, interestData) {
  return interestModel.findByIdAndUpdate(id, interestData, {
    new: true,
    runValidators: true,
  });
}

export default {
  getUsers,
  addInterest,
  deleteInterest,
  updateInterest,
};
