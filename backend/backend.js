import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { fetch as undiciFetch } from 'undici';

// Routers
import eventRouter from './EventFiles/EventRoutes.js';
import interestRouter from './InterestFiles/InterestRoutes.js';
import geocodeRouter from './GeoFiles/GeocodeRoutes.js';
import googleAuthRouter from './OAuth/GoogleAuthRoutes.js';

// Load environment variables
dotenv.config();

// Polyfill fetch for Node 16
if (!globalThis.fetch) {
  globalThis.fetch = undiciFetch;
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Session + Passport (if used in your project)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/events', eventRouter);
app.use('/interests', interestRouter);
app.use('/geocode', geocodeRouter);
app.use('/auth', googleAuthRouter);

// MongoDB Connection (SAFE VERSION)
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn('⚠️ MONGODB_URI not set — skipping MongoDB connection');
} else {
  mongoose
    .connect(uri)
    .then(() => {
      console.log('✅ MongoDB connection established');
    })
    .catch((error) => {
      console.error('❌ Failed to connect to MongoDB');
      console.error(error);
    });
}

// Only start server if NOT in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
  });
}

// Export app for testing
export default app;
