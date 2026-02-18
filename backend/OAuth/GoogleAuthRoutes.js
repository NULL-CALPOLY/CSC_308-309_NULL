import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Try a few common env var names for callback URL (supports different teammate setups)
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  process.env.GOOGLE_REDIRECT_URI ||
  'http://localhost:3000/auth/google/callback';

// Where to send the user after auth success (your frontend)
const FRONTEND_SUCCESS_REDIRECT =
  process.env.FRONTEND_SUCCESS_REDIRECT || 'http://localhost:5173/';

// Where to send the user after auth failure
const FRONTEND_FAILURE_REDIRECT =
  process.env.FRONTEND_FAILURE_REDIRECT || 'http://localhost:5173/login';

let oauthEnabled = false;

// Minimal serialize/deserialize so Passport session doesn’t break.
// (In a real app you’d store a user record; for now we just keep the profile.)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn(
    '⚠️ Google OAuth disabled: missing GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET'
  );
} else {
  oauthEnabled = true;

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        // TODO: Optionally create/find user in DB here
        return done(null, profile);
      }
    )
  );
}

// --- Routes ---

// Health/info endpoint (nice for debugging)
router.get('/', (req, res) => {
  if (!oauthEnabled) {
    return res.status(501).json({
      message:
        'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable.',
    });
  }
  return res.status(200).json({ message: 'Google OAuth is configured.' });
});

// Start Google OAuth
router.get('/google', (req, res, next) => {
  if (!oauthEnabled) {
    return res.status(501).json({
      message:
        'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable.',
    });
  }

  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })(req, res, next);
});

// Callback URL Google redirects to
router.get('/google/callback', (req, res, next) => {
  if (!oauthEnabled) {
    return res.status(501).json({
      message:
        'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable.',
    });
  }

  return passport.authenticate('google', {
    failureRedirect: FRONTEND_FAILURE_REDIRECT,
    session: true,
  })(req, res, () => {
    // Success
    res.redirect(FRONTEND_SUCCESS_REDIRECT);
  });
});

// Optional: a simple endpoint to see if user is authed
router.get('/me', (req, res) => {
  if (!oauthEnabled) {
    return res.status(501).json({
      message:
        'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable.',
    });
  }

  // Passport attaches user to req.user when session is enabled
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  return res.status(200).json({ user: req.user });
});

// Optional: logout
router.post('/logout', (req, res) => {
  if (typeof req.logout === 'function') {
    req.logout(() => {
      res.status(200).json({ message: 'Logged out' });
    });
  } else {
    res.status(200).json({ message: 'Logged out' });
  }
});

export default router;
