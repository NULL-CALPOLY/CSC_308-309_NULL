import mongoose from 'mongoose';

const InterestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    similarInterests: {
      type: [{ type: mongoose.Schema.Types.ObjectId }],
      required: false,
    },
  },
  { collection: 'interests_list' }
);

const Interest = mongoose.model('Interest', InterestSchema);

export default Interest;
