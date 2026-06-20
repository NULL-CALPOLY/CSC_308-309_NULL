import jwt from 'jsonwebtoken';
import User from '../UserFiles/UserSchema.js';

/**
 * Extract a Bearer access token from the Authorization header.
 * @returns {string | null}
 */
function extractToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

/**
 * Require a valid access token. Sets `req.userId` to the authenticated user id.
 * Responds 401 if the token is missing, malformed, or expired.
 */
export function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    req.userId = payload.id;
    return next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' });
  }
}

/**
 * Attach `req.userId` when a valid token is present, but never block the
 * request. Use for public endpoints that personalize results when logged in
 * (e.g. landing-page event previews, public profiles).
 */
export function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
      req.userId = payload.id;
    } catch {
      // Ignore invalid tokens for optional auth — treat as anonymous.
    }
  }
  return next();
}

/**
 * Guard that the authenticated user matches the `:id`/`:userId` route param,
 * so users can only mutate their own account / RSVP themselves, etc.
 * Must run after `requireAuth`.
 */
export function requireSelf(paramName = 'id') {
  return (req, res, next) => {
    if (req.userId !== req.params[paramName]) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to perform this action',
      });
    }
    return next();
  };
}

/**
 * Require the authenticated user to be a site administrator (isAdmin).
 * Must run after `requireAuth`. Loads the user and sets `req.user`.
 */
export async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: 'Administrator access required' });
    }
    req.user = user;
    return next();
  } catch {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to verify admin access' });
  }
}
