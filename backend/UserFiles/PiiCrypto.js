import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const KEY_ENV = 'PII_ENCRYPTION_KEY';
const CIPHER_VERSION = 'pii-v1';

function getKey() {
  const encodedKey = process.env[KEY_ENV];
  if (!encodedKey) throw new Error(`${KEY_ENV} must be configured`);

  const key = Buffer.from(encodedKey, 'base64');
  if (key.length !== 32) {
    throw new Error(`${KEY_ENV} must be a base64-encoded 32-byte key`);
  }

  return key;
}

function aadFor(field) {
  return Buffer.from(`users_list.pii:${field}:${CIPHER_VERSION}`, 'utf8');
}

export function assertPiiCryptoConfiguration() {
  getKey();
}

export function isEncryptedPii(value, field) {
  if (typeof value !== 'string') return false;

  const parts = value.split('.');
  return (
    parts.length === 5 &&
    parts[0] === CIPHER_VERSION &&
    parts[1] === field &&
    /^[A-Za-z0-9_-]+$/.test(parts[2]) &&
    /^[A-Za-z0-9_-]+$/.test(parts[3]) &&
    /^[A-Za-z0-9_-]+$/.test(parts[4])
  );
}

export function encryptPii(field, value) {
  if (value === undefined) throw new Error(`Cannot encrypt undefined ${field}`);

  const initializationVector = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(), initializationVector);
  cipher.setAAD(aadFor(field));

  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), 'utf8'),
    cipher.final(),
  ]);
  const authenticationTag = cipher.getAuthTag();

  return [
    CIPHER_VERSION,
    field,
    initializationVector.toString('base64url'),
    authenticationTag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

export function decryptPii(field, encryptedValue) {
  if (!isEncryptedPii(encryptedValue, field)) {
    throw new Error(`${field} ciphertext has an invalid format`);
  }

  const [, , encodedIv, encodedTag, encodedCiphertext] = encryptedValue.split('.');
  const initializationVector = Buffer.from(encodedIv, 'base64url');
  const authenticationTag = Buffer.from(encodedTag, 'base64url');

  if (initializationVector.length !== 12 || authenticationTag.length !== 16) {
    throw new Error(`${field} ciphertext has invalid encryption parameters`);
  }

  const decipher = createDecipheriv('aes-256-gcm', getKey(), initializationVector);
  decipher.setAAD(aadFor(field));
  decipher.setAuthTag(authenticationTag);

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, 'base64url')),
    decipher.final(),
  ]).toString('utf8');

  return JSON.parse(plaintext);
}
