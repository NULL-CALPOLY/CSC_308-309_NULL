import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      alias: 'phone',
    },
    inviteOnly: {
      type: Boolean,
      default: false,
    },
    members: {
      type: [{ type: mongoose.Schema.Types.ObjectId }],
      default: [],
    },
  },
  {
    collection: 'organization_list',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Organization = mongoose.model('Organization', OrganizationSchema);

export default Organization;
