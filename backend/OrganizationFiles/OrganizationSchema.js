import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: '',
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
    logo: {
      type: String,
      default: null,
    },
    logoPublicId: {
      type: String,
      default: null,
    },
    // The user who registered the club. Always treated as an admin.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    admins: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    members: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    inviteOnly: {
      type: Boolean,
      default: false,
    },
    // When true, only verified students (e.g. @calpoly.edu) can join and see
    // this club's events.
    studentOnly: {
      type: Boolean,
      default: false,
    },
    // Master-admin approval workflow. New registrations start 'pending' and are
    // invisible to the public until an admin approves them.
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    collection: 'organization_list',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

OrganizationSchema.index({ status: 1 });
OrganizationSchema.index({ members: 1 });

const Organization = mongoose.model('Organization', OrganizationSchema);

export default Organization;
