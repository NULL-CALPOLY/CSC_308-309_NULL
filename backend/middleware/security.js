import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

// No-op middleware used to disable rate limiting under tests so the suite
// can hammer endpoints without tripping limits.
const passthrough = (req, res, next) => next();

/**
 * Broad limiter applied to the whole API as a backstop against abuse.
 */
export const globalLimiter = isTest
  ? passthrough
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many requests, please try again later.',
      },
    });

/**
 * Stricter limiter for authentication endpoints (login / register) to slow
 * credential-stuffing and brute-force attempts.
 */
export const authLimiter = isTest
  ? passthrough
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many attempts, please try again later.',
      },
    });

/**
 * Express-5-safe NoSQL-injection guard.
 *
 * express-mongo-sanitize can't be used on Express 5 because it reassigns the
 * now read-only `req.query`. Instead we scrub only `req.body` in place,
 * removing any keys that start with `$` or contain `.` (Mongo operator /
 * dot-path injection vectors). Route params are always strings, so they can't
 * carry operator objects.
 */
export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    scrub(req.body);
  }
  return next();
}

function scrub(value) {
  if (Array.isArray(value)) {
    value.forEach((v) => v && typeof v === 'object' && scrub(v));
    return;
  }
  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete value[key];
    } else if (value[key] && typeof value[key] === 'object') {
      scrub(value[key]);
    }
  }
}
