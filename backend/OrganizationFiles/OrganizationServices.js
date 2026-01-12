import organizationModel from './OrganizationSchema.js';

// Get all organizations
function getOrganizations() {
  return organizationModel.find().populate("members");
}

// Add a new organization
function addOrganization(organization) {
  const newOrganization = new organizationModel(organization);
  return newOrganization.save();
}

// Delete an organization by ID
function deleteOrganization(id) {
  return organizationModel.findByIdAndDelete(id).populate("members");
}

// Update an organization by ID
function updateOrganization(id, organizationData) {
  return organizationModel
    .findByIdAndUpdate(id, organizationData, {
      new: true,
      runValidators: true,
    })
}

// Find organization by iD
function findOrganizationById(id) {
    return organizationModel.findById(id).populate("members");
}

// Find organization by name
function findOrganizationByName(name) {
    return organizationModel.find({ name: { $regex: name, $options: "i" } }).populate("members");
}

// Find organization by email
function findOrganizationByEmail(email) {
    return organizationModel.find({ email: { $regex: email, $options: "i" } }).populate("members");
}

// Find organization by phone number
function findOrganizationByPhoneNumber(phoneNumber) {
    return organizationModel.find({ phoneNumber: { $regex: phoneNumber, $options: "i" } }).populate("members");
}

// Find organization by invite only status
function findOrganizationByInviteOnly(inviteOnly) {
    return organizationModel.find({ inviteOnly: inviteOnly }).populate("members");
}

// Find organization by member user ID
function findOrganizationByMember(userId) {
    return organizationModel.find({ members: userId }).populate("members");
}

// Add user to members
function addUserToMembers(organizationId, userId) {
  return organizationModel
    .findByIdAndUpdate(
      organizationId,
      { $addToSet: { members: userId } },
      { new: true }
    )
    .populate('members');
}

// Remove user from members
function removeUserFromMembers(organizationId, userId) {
  return organizationModel
    .findByIdAndUpdate(organizationId, { $pull: { members: userId } }, { new: true })
    .populate('members');
}

export default {
    getOrganizations,
    addOrganization,
    deleteOrganization,
    updateOrganization,
    findOrganizationById,
    findOrganizationByName,
    findOrganizationByEmail,
    findOrganizationByPhoneNumber,
    findOrganizationByInviteOnly,
    findOrganizationByMember,
    addUserToMembers,
    removeUserFromMembers,
}