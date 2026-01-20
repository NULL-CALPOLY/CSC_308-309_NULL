import interestModel from './InterestSchema.js';

// Get all interests
function getInterests() {
  return interestModel.find();
}

// Add an interest
function addInterest(interest) {
  const newInterest = new interestModel(interest);
  return newInterest.save();
}

// Delete an interest
function deleteInterest(id) {
  return interestModel.findByIdAndDelete(id);
}

// Update an interest
function updateInterest(id, interestData) {
  return interestModel.findByIdAndUpdate(id, interestData, {
    new: true,
    runValidators: true,
  });
}

// Find interest by Id
function findInterestById(id) {
  return interestModel.findById(id);
}

// Find interest by name
function findInterestByName(name) {
  return interestModel.find({ name: { $regex: name, $options: 'i' } });
}

// FInd interests by similar interests
function findInterestBySimilarInterests(interestId) {
  return interestModel
    .find({ similarInterests: { $in: interestId } })
    .populate('similarInterests');
}

// Add user to similar interests
function addInterestsToSimilarInterests(interestId, addedInterestId) {
  return interestModel
    .findByIdAndUpdate(
      interestId,
      { $addToSet: { similarInterests: addedInterestId } },
      { new: true }
    )
    .populate('similarInterests');
}

// Remove user from similar interests
function removeInterestsFromSimilarInterests(interestId, removedInterestId) {
  return interestModel
    .findByIdAndUpdate(
      interestId,
      { $pull: { similarInterests: removedInterestId } },
      { new: true }
    )
    .populate('similarInterests');
}

export default {
  getInterests,
  addInterest,
  deleteInterest,
  updateInterest,
  findInterestById,
  findInterestByName,
  findInterestBySimilarInterests,
  addInterestsToSimilarInterests,
  removeInterestsFromSimilarInterests,
};
