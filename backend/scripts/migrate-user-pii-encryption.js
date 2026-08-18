import { config } from 'dotenv';
import mongoose from 'mongoose';

config();

const { default: User } = await import('../UserFiles/UserSchema.js');
const {
  assertPiiCryptoConfiguration,
  encryptPii,
  isEncryptedPii,
} = await import('../UserFiles/PiiCrypto.js');

const PII_FIELDS = ['phoneNumber', 'dateOfBirth', 'gender', 'location'];

if (process.env.CONFIRM_PII_MIGRATION !== 'yes') {
  throw new Error(
    'Set CONFIRM_PII_MIGRATION=yes after taking a database backup to run this migration.'
  );
}

assertPiiCryptoConfiguration();

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI must be configured');
}

function migrationValue(field, value) {
  return field === 'dateOfBirth' && value instanceof Date
    ? value.toISOString()
    : value;
}

let migratedDocumentCount = 0;
let migratedFieldCount = 0;

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const collection = User.collection;

  const indexes = await collection.indexes();
  for (const index of indexes) {
    const indexesLocation = Object.keys(index.key).some(
      (key) => key === 'location' || key.startsWith('location.')
    );
    if (index.name !== '_id_' && indexesLocation) {
      await collection.dropIndex(index.name);
    }
  }

  const cursor = collection.find({});
  for await (const user of cursor) {
    const updates = {};

    for (const field of PII_FIELDS) {
      const value = user[field];
      if (value === undefined || value === null || isEncryptedPii(value, field)) {
        continue;
      }

      updates[field] = encryptPii(field, migrationValue(field, value));
      migratedFieldCount += 1;
    }

    if (Object.keys(updates).length > 0) {
      await collection.updateOne({ _id: user._id }, { $set: updates });
      migratedDocumentCount += 1;
    }
  }

  console.log(
    `Migrated ${migratedFieldCount} PII field(s) across ${migratedDocumentCount} user document(s).`
  );
} finally {
  await mongoose.disconnect();
}
