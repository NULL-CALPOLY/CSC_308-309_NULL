import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from 'dotenv';
import path from 'path';

// Load .env.test for tests/CI, fallback to .env
const envPath = [
  path.resolve(process.cwd(), '.env.test'),
  path.resolve(process.cwd(), '.env'),
].find((p) => {
  try {
    require('fs').accessSync(p);
    return true;
  } catch {
    return false;
  }
});
config({ path: envPath });
import User from '../UserFiles/UserSchema.js';
import { isStudentEmail } from '../utils/studentEmail.js';
import { isAdminEmail } from '../utils/adminEmail.js';

const router = express.Router();

// Configure Passport Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === 'production'
          ? `${process.env.BACKEND_URL}/auth/google/callback`
          : 'http://localhost:3000/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('Google profile:', profile);
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        // Google has authenticated this email, so a student domain here is a
        // genuine "verified student" signal (Cal Poly accounts are Google
        // Workspace accounts) — unlike a self-typed email at password signup.
        const verifiedStudent = isStudentEmail(email);
        const admin = isAdminEmail(email);

        let user = await User.findOne({ googleId: profile.id });

        // Not found by googleId — link to an existing email/password account
        // with the same email instead of creating a duplicate (which would hit
        // the unique-email index and throw E11000).
        if (!user && email) {
          user = await User.findOne({ email });
        }

        if (!user) {
          user = new User({
            googleId: profile.id,
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          });
        } else if (!user.googleId) {
          // Link Google to the existing account.
          user.googleId = profile.id;
          if (!user.avatar) user.avatar = profile.photos?.[0]?.value;
        }

        // Sync server-controlled flags every login.
        user.isVerifiedStudent = verifiedStudent;
        user.isAdmin = admin;
        await user.save();

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Session handling
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// OAuth callback — custom handler so any failure redirects back to the SPA
// with a friendly ?authError= message instead of dumping raw JSON.
router.get('/google/callback', (req, res, next) => {
  const frontendBase =
    process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : 'http://localhost:5173';

  passport.authenticate('google', (err, user) => {
    if (err || !user) {
      const msg = encodeURIComponent(
        'Google sign-in failed. Please try again.'
      );
      return res.redirect(`${frontendBase}/?authError=${msg}`);
    }

    // Issue the SAME tokens as standard email/password auth so the whole
    // app runs on one JWT model (no longer relying on the passport session
    // for app auth).
    const userId = user._id;

    const accessToken = jwt.sign({ id: userId }, process.env.JWT_TOKEN_SECRET, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(
      { id: userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Set refresh token as HttpOnly cookie (identical options to /users/login)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to the SPA carrying the access token in the URL hash so the
    // frontend can store it and populate auth state.
    res.redirect(`${frontendBase}/#token=${accessToken}&userId=${userId}`);
  })(req, res, next);
});

// Who am I (frontend uses this)
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ user: null });
  }
  res.json({ user: req.user });
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy();
    res.clearCookie('connect.sid');
    const redirectUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : 'http://localhost:5173';
    res.redirect(redirectUrl);
  });
});

export default router;
