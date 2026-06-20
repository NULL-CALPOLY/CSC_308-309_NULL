/**
 * Seed the interests_list collection with a base set of interests.
 *
 * Idempotent: upserts each interest by its normalizedName, so re-running the
 * script never creates duplicates. Reads the connection string from
 * process.env.MONGODB_URI.
 *
 * How to run (from the repo root):
 *   MONGODB_URI="mongodb://localhost:27017/findr" node backend/scripts/seedInterests.js
 *
 * Or, if MONGODB_URI is already set in your environment / loaded via dotenv:
 *   node backend/scripts/seedInterests.js
 */

import mongoose from 'mongoose';
import interestModel, {
  normalizeInterestName,
} from '../InterestFIles/InterestSchema.js';

// Base interests grouped by category. Display names are kept human-friendly;
// normalizedName is derived at upsert time for safe deduping.
const BASE_INTERESTS = [
  // Sports
  { name: 'Basketball', category: 'Sports' },
  { name: 'Soccer', category: 'Sports' },
  { name: 'Tennis', category: 'Sports' },
  { name: 'Volleyball', category: 'Sports' },
  // Music
  { name: 'Live Music', category: 'Music' },
  { name: 'Concerts', category: 'Music' },
  { name: 'DJ Sets', category: 'Music' },
  { name: 'Karaoke', category: 'Music' },
  // Academics
  { name: 'Study Groups', category: 'Academics' },
  { name: 'Research', category: 'Academics' },
  { name: 'Debate', category: 'Academics' },
  { name: 'Tutoring', category: 'Academics' },
  // Arts
  { name: 'Painting', category: 'Arts' },
  { name: 'Photography', category: 'Arts' },
  { name: 'Theater', category: 'Arts' },
  { name: 'Film', category: 'Arts' },
  // Outdoors
  { name: 'Hiking', category: 'Outdoors' },
  { name: 'Camping', category: 'Outdoors' },
  { name: 'Surfing', category: 'Outdoors' },
  { name: 'Climbing', category: 'Outdoors' },
  // Gaming
  { name: 'Video Games', category: 'Gaming' },
  { name: 'Board Games', category: 'Gaming' },
  { name: 'Esports', category: 'Gaming' },
  { name: 'Tabletop RPGs', category: 'Gaming' },
  // Food
  { name: 'Cooking', category: 'Food' },
  { name: 'Baking', category: 'Food' },
  { name: 'Coffee', category: 'Food' },
  { name: 'Food Trucks', category: 'Food' },
  // Tech
  { name: 'Programming', category: 'Tech' },
  { name: 'Hackathons', category: 'Tech' },
  { name: 'Robotics', category: 'Tech' },
  { name: 'AI & Machine Learning', category: 'Tech' },
  // Social
  { name: 'Networking', category: 'Social' },
  { name: 'Volunteering', category: 'Social' },
  { name: 'Book Clubs', category: 'Social' },
  { name: 'Game Nights', category: 'Social' },
];

async function seedInterests() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set. Aborting seed.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB. Seeding interests...');

  let upserted = 0;
  for (const interest of BASE_INTERESTS) {
    const normalizedName = normalizeInterestName(interest.name);
    // Upsert by normalizedName so re-running is safe (no duplicates).
    await interestModel.updateOne(
      { normalizedName },
      {
        $set: {
          name: interest.name,
          category: interest.category,
          normalizedName,
        },
        $setOnInsert: { similarInterests: [] },
      },
      { upsert: true }
    );
    upserted += 1;
  }

  console.log(`✅ Seed complete. Upserted ${upserted} interests.`);
  await mongoose.connection.close();
}

seedInterests().catch(async (error) => {
  console.error('❌ Seed failed:', error);
  try {
    await mongoose.connection.close();
  } catch {
    // ignore close errors during failure cleanup
  }
  process.exit(1);
});
