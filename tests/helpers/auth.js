import jwt from 'jsonwebtoken';

/**
 * Build an Authorization header with a signed access token for tests.
 * requireAuth only verifies the signature, so the id need not be a real user.
 * @param {string|object} userId
 * @returns {{ Authorization: string }}
 */
export function authHeader(userId) {
  const token = jwt.sign({ id: String(userId) }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: '15m',
  });
  return { Authorization: `Bearer ${token}` };
}
