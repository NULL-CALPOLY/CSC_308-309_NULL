import organizationModel from './OrganizationSchema.js';

// Get all organizations (admin use). For the public catalog use
// getApprovedOrganizations.
function getOrganizations() {
  return organizationModel.find().populate('members');
}

// Public catalog — only approved clubs.
function getApprovedOrganizations() {
  return organizationModel.find({ status: 'approved' }).sort({ name: 1 });
}

// Admin queue — clubs by review status (default pending).
function getOrganizationsByStatus(status = 'pending') {
  return organizationModel
    .find({ status })
    .sort({ createdAt: 1 })
    .populate('owner', 'name email');
}

// Register a new club. Always starts 'pending' with the registrant as
// owner/admin/member, regardless of any status the client tries to send.
function createOrganization(data, ownerId) {
  const { status, owner, admins, members, reviewedBy, reviewedAt, ...safe } =
    data || {};
  const newOrganization = new organizationModel({
    ...safe,
    owner: ownerId,
    admins: [ownerId],
    members: [ownerId],
    status: 'pending',
  });
  return newOrganization.save();
}

// Legacy helper kept for the existing tests / callers.
function addOrganization(organization) {
  const newOrganization = new organizationModel(organization);
  return newOrganization.save();
}

function approveOrganization(id, adminId) {
  return organizationModel.findByIdAndUpdate(
    id,
    {
      status: 'approved',
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason: '',
    },
    { new: true, runValidators: true }
  );
}

function rejectOrganization(id, adminId, reason = '') {
  return organizationModel.findByIdAndUpdate(
    id,
    {
      status: 'rejected',
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason: reason,
    },
    { new: true, runValidators: true }
  );
}

// Delete an organization by ID
function deleteOrganization(id) {
  return organizationModel.findByIdAndDelete(id);
}

// Update an organization by ID. Server-controlled fields are stripped so an
// org admin can't change approval state or ownership via the edit form.
function updateOrganization(id, organizationData) {
  const {
    status,
    owner,
    reviewedBy,
    reviewedAt,
    rejectionReason,
    admins,
    members,
    ...updateData
  } = organizationData || {};

  // Support `phone` alias by mapping it to the stored `phoneNumber` field
  if (
    Object.prototype.hasOwnProperty.call(updateData, 'phone') &&
    !Object.prototype.hasOwnProperty.call(updateData, 'phoneNumber')
  ) {
    updateData.phoneNumber = updateData.phone;
    delete updateData.phone;
  }

  return organizationModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
}

// Find organization by iD
function findOrganizationById(id) {
  return organizationModel.findById(id).populate('members');
}

// Find organization by name
function findOrganizationByName(name) {
  return organizationModel
    .find({ name: { $regex: name, $options: 'i' } })
    .populate('members');
}

// Find organization by email
function findOrganizationByEmail(email) {
  return organizationModel
    .find({ email: { $regex: email, $options: 'i' } })
    .populate('members');
}

// Find organization by phone number
function findOrganizationByPhoneNumber(phoneNumber) {
  return organizationModel
    .find({ phoneNumber: { $regex: phoneNumber, $options: 'i' } })
    .populate('members');
}

// Find organization by invite only status
function findOrganizationByInviteOnly(inviteOnly) {
  return organizationModel.find({ inviteOnly: inviteOnly }).populate('members');
}

// Find organization by member user ID
function findOrganizationByMember(userId) {
  return organizationModel.find({ members: userId });
}

// Find organizations owned/administered by a user.
function findOrganizationByAdmin(userId) {
  return organizationModel.find({
    $or: [{ owner: userId }, { admins: userId }],
  });
}

// Add user to members
function addUserToMembers(organizationId, userId) {
  return organizationModel.findByIdAndUpdate(
    organizationId,
    { $addToSet: { members: userId } },
    { new: true }
  );
}

// Remove user from members
function removeUserFromMembers(organizationId, userId) {
  return organizationModel.findByIdAndUpdate(
    organizationId,
    { $pull: { members: userId } },
    { new: true }
  );
}

// Is this user an owner or admin of the org doc?
function isOrgAdmin(org, userId) {
  if (!org || !userId) return false;
  const uid = String(userId);
  if (String(org.owner) === uid) return true;
  return (org.admins || []).some((a) => String(a) === uid);
}

export default {
  getOrganizations,
  getApprovedOrganizations,
  getOrganizationsByStatus,
  createOrganization,
  addOrganization,
  approveOrganization,
  rejectOrganization,
  deleteOrganization,
  updateOrganization,
  findOrganizationById,
  findOrganizationByName,
  findOrganizationByEmail,
  findOrganizationByPhoneNumber,
  findOrganizationByInviteOnly,
  findOrganizationByMember,
  findOrganizationByAdmin,
  addUserToMembers,
  removeUserFromMembers,
  isOrgAdmin,
};
