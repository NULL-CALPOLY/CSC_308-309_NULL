import { config } from 'dotenv';
import mongoose from 'mongoose';

config();

const { default: User } = await import('../UserFiles/UserSchema.js');
const {
  assertEmailCryptoConfiguration,
  createEmailLookupHash,
  decryptEmail,
  encryptEmail,
  isEncryptedEmail,
  normalizeEmail,
} = await import('../UserFiles/EmailCrypto.js');

if (process.env.CONFIRM_EMAIL_MIGRATION !== 'yes') {
  throw new Error(
    'Set CONFIRM_EMAIL_MIGRATION=yes after taking a database backup to run this migration.'
  );
}

assertEmailCryptoConfiguration();

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI must be configured');
}

let migratedCount = 0;

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const collection = User.collection;

  await collection.createIndex(
    { emailLookupHash: 1 },
    { name: 'emailLookupHash_1', unique: true, sparse: true }
  );

  const cursor = collection.find({
    email: { $type: 'string' },
    emailLookupHash: { $exists: false },
  });

  for await (const user of cursor) {
    const normalizedEmail = isEncryptedEmail(user.email)
      ? decryptEmail(user.email)
      : normalizeEmail(user.email);

    await collection.updateOne(
      { _id: user._id, emailLookupHash: { $exists: false } },
      {
        $set: {
          email: encryptEmail(normalizedEmail),
          emailLookupHash: createEmailLookupHash(normalizedEmail),
        },
      }
    );
    migratedCount += 1;
  }

  const indexes = await collection.indexes();
  if (indexes.some((index) => index.name === 'email_1')) {
    await collection.dropIndex('email_1');
  }

  console.log(`Migrated ${migratedCount} email record(s).`);
} finally {
  await mongoose.disconnect();
}
