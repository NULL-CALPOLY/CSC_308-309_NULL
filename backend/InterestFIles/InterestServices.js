import interestModel, { normalizeInterestName } from './InterestSchema.js';

// Get all interests
function getInterests() {
  return interestModel.find();
}

// Look up an interest by its canonical normalized name (exact match).
// Returns null when none exists or the name is empty.
function findInterestByNormalizedName(name) {
  const normalizedName = normalizeInterestName(name);
  if (!normalizedName) return Promise.resolve(null);
  return interestModel.findOne({ normalizedName });
}

// Add an interest.
// Dedupes by normalizedName so user-suggested tags never create duplicates:
// if an interest with the same normalized name already exists, return it
// instead of creating a new document.
async function addInterest(interest) {
  const existing = await findInterestByNormalizedName(interest?.name);
  if (existing) return existing;

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

// Typeahead search: case-insensitive substring match on `name`, sorted by
// name, capped at `limit`. Empty/whitespace query returns [].
function searchInterests(q, limit = 20) {
  if (typeof q !== 'string' || q.trim() === '') return Promise.resolve([]);

  // Escape regex metacharacters so user input is treated as a literal substring.
  const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return interestModel
    .find({ name: { $regex: escaped, $options: 'i' } })
    .sort({ name: 1 })
    .limit(limit);
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
  findInterestByNormalizedName,
  searchInterests,
  findInterestBySimilarInterests,
  addInterestsToSimilarInterests,
  removeInterestsFromSimilarInterests,
};
