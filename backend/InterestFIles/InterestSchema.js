import mongoose from 'mongoose';

// Normalize a display name into a canonical key used for dedupe + search:
// lowercase, trim, and collapse runs of internal whitespace to single spaces.
export function normalizeInterestName(name) {
  if (typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

const InterestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional grouping (e.g. Sports, Music, Tech). Free-form, trimmed.
    category: {
      type: String,
      required: false,
      trim: true,
    },
    // Canonical key derived from `name`. Used to dedupe user-suggested tags.
    // unique + sparse so legacy docs without the field don't collide on null.
    normalizedName: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      unique: true,
      sparse: true,
    },
    similarInterests: {
      type: [{ type: mongoose.Schema.Types.ObjectId }],
      required: false,
    },
  },
  { collection: 'interests_list' }
);

// Derive normalizedName from name on every validate so it stays in sync
// whether the doc is created or its name is updated via .save().
InterestSchema.pre('validate', function deriveNormalizedName(next) {
  if (this.name) {
    this.normalizedName = normalizeInterestName(this.name);
  }
  next();
});

const Interest = mongoose.model('Interest', InterestSchema);

export default Interest;
