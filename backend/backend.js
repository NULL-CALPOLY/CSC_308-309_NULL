import mongoose from 'mongoose';
import path from 'path';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import fs from 'fs';

// Load .env.test for tests/CI, fallback to .env
const envPath = [
  path.resolve(process.cwd(), '.env.test'),
  path.resolve(process.cwd(), '.env'),
].find((p) => {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
});
config({ path: envPath });

import express from 'express';
import eventRouter from './EventFiles/EventRoutes.js';
import userRouter from './UserFiles/UserRoutes.js';
import chatRouter from './ChatFiles/ChatRoutes.js';
import organizationRouter from './OrganizationFiles/OrganizationRoutes.js';
import interestRouter from './InterestFIles/InterestRoutes.js';
import cors from 'cors';
import googleAuthRouter from './OAuth/GoogleAuthRoutes.js';
import passport from 'passport';
import session from 'express-session';

// Intialize Express app
const app = express();
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.error(
    '❌ FRONTEND_URL is not set. CORS will block all frontend requests.'
  );
}

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true, // Allow all in dev
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true if HTTPS
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Needed for cross-domain cookies
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
};

// Only use MongoStore outside of tests (MONGODB_URI not available in test env)
if (process.env.NODE_ENV !== 'test') {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 14 * 24 * 60 * 60, // Sessions will expire in 14 days
    autoRemove: 'native', // Let MongoDB handle the cleanup
  });
}

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

app.use('/events', eventRouter);
app.use('/users', userRouter);
app.use('/organizations', organizationRouter);
app.use('/chats', chatRouter);
app.use('/interests', interestRouter);
app.use('/auth', googleAuthRouter);

// Start the server
app.get('/', (req, res) => {
  res.send('see github for instructions to use db');
});

// pull up the MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

// Helper function to start the server
const startServer = () => {
  app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
  });
};

// Connection Logic
if (process.env.NODE_ENV === 'test') {
  // In tests, we export the app and let the test runner handle the connection
  console.log('🧪 Running in test mode');
} else {
  if (!uri) {
    console.error(
      '❌ MONGODB_URI is missing. Check your Azure/Local variables.'
    );
    process.exit(1);
  }

  mongoose
    .connect(uri)
    .then(() => {
      console.log('✅ MongoDB connection established');
      // ONLY start listening once we are sure the DB is ready
      startServer();
    })
    .catch((error) => {
      console.error('❌ Failed to connect to MongoDB. Server not started.');
      console.error(error);
      process.exit(1); // Don't let a "broken" server stay alive in production
    });
}

export default app;
