import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from 'dotenv';
import path from 'path';
import User from '../UserFiles/UserSchema.js';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env') });

const router = express.Router();

// Configure Passport Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
    console.log('Google profile:', profile);
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          });
        }

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

// OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // or frontend URL
  }
);

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
    res.redirect('/');
  });
});

export default router;
