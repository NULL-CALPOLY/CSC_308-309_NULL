import mongoose from 'mongoose';

const InterestSchema = new mongoose.Schema(
  {
    interestName: {
      type: String,
      required: true,
      trim: true,
    },
    similarInterests: {
      type: [{ type: String }],
      required: false,
    },
  },
  { collection: 'interests_list' }
);

const Interest = mongoose.model('Interest', InterestSchema);

export default Interest;
