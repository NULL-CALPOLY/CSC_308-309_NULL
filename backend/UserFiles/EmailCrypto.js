import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from 'crypto';

const ENCRYPTION_KEY_ENV = 'EMAIL_ENCRYPTION_KEY';
const LOOKUP_KEY_ENV = 'EMAIL_LOOKUP_KEY';
const CIPHER_VERSION = 'v1';
const AAD = Buffer.from('users_list.email:v1', 'utf8');
const LOOKUP_DOMAIN = 'users_list.email-lookup:v1\0';

function getKey(environmentVariable) {
  const encodedKey = process.env[environmentVariable];
  if (!encodedKey) {
    throw new Error(`${environmentVariable} must be configured`);
  }

  const key = Buffer.from(encodedKey, 'base64');
  if (key.length !== 32) {
    throw new Error(
      `${environmentVariable} must be a base64-encoded 32-byte key`
    );
  }

  return key;
}

export function assertEmailCryptoConfiguration() {
  getKey(ENCRYPTION_KEY_ENV);
  getKey(LOOKUP_KEY_ENV);
}

export function normalizeEmail(email) {
  if (typeof email !== 'string') {
    throw new Error('Email must be a string');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('Email is required');
  }

  return normalizedEmail;
}

export function createEmailLookupHash(email) {
  const normalizedEmail = normalizeEmail(email);
  return createHmac('sha256', getKey(LOOKUP_KEY_ENV))
    .update(LOOKUP_DOMAIN, 'utf8')
    .update(normalizedEmail, 'utf8')
    .digest('base64url');
}

export function isEncryptedEmail(value) {
  return (
    typeof value === 'string' &&
    new RegExp(
      `^${CIPHER_VERSION}\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$`
    ).test(value)
  );
}

export function encryptEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  const initializationVector = randomBytes(12);
  const cipher = createCipheriv(
    'aes-256-gcm',
    getKey(ENCRYPTION_KEY_ENV),
    initializationVector
  );
  cipher.setAAD(AAD);

  const ciphertext = Buffer.concat([
    cipher.update(normalizedEmail, 'utf8'),
    cipher.final(),
  ]);
  const authenticationTag = cipher.getAuthTag();

  return [
    CIPHER_VERSION,
    initializationVector.toString('base64url'),
    authenticationTag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

export function decryptEmail(encryptedEmail) {
  if (!isEncryptedEmail(encryptedEmail)) {
    throw new Error('Email ciphertext has an invalid format');
  }

  const [, encodedIv, encodedTag, encodedCiphertext] =
    encryptedEmail.split('.');
  const initializationVector = Buffer.from(encodedIv, 'base64url');
  const authenticationTag = Buffer.from(encodedTag, 'base64url');

  if (initializationVector.length !== 12 || authenticationTag.length !== 16) {
    throw new Error('Email ciphertext has invalid encryption parameters');
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getKey(ENCRYPTION_KEY_ENV),
    initializationVector
  );
  decipher.setAAD(AAD);
  decipher.setAuthTag(authenticationTag);

  return Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}
