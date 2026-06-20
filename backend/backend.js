import mongoose from 'mongoose';
import path from 'path';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import session from 'express-session';
import { globalLimiter, sanitizeBody } from './middleware/security.js';
import eventRouter from './EventFiles/EventRoutes.js';
import userRouter from './UserFiles/UserRoutes.js';
import organizationRouter from './OrganizationFiles/OrganizationRoutes.js';
import commentRouter from './CommentFiles/CommentsRoutes.js';
import interestRouter from './InterestFIles/InterestRoutes.js';
import cloudinaryRouter from './Cloudinary.js';
import googleAuthRouter from './OAuth/GoogleAuthRoutes.js';

// Load .env.test for tests/CI, fallback to .env
// NOTE: env vars used at module level (sessionConfig, etc.) are safe here
// because all imports above are side-effect-only at parse time; their
// process.env reads happen inside functions called after this config() call.
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

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.error(
    '❌ FRONTEND_URL is not set. CORS will block all frontend requests.'
  );
}

if (!process.env.SESSION_SECRET) {
  console.error(
    '❌ SESSION_SECRET is not set. Sessions will not work correctly.'
  );
  if (process.env.NODE_ENV === 'production') process.exit(1);
}

// Security headers. This is a JSON API consumed cross-origin by the frontend,
// so relax cross-origin resource policy (CORS already governs fetch access)
// and skip CSP (not meaningful for non-HTML responses).
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true, // Allow all in dev
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Broad rate-limit backstop across the whole API (no-op under tests).
app.use(globalLimiter);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Strip Mongo operator keys ($..., a.b) from request bodies (NoSQL injection).
app.use(sanitizeBody);

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset cookie expiration on every response
  cookie: {
    httpOnly: true, // Prevent client-side JS from reading the session cookie
    secure: process.env.NODE_ENV === 'production', // true if HTTPS
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Needed for cross-domain cookies
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
};

// Only use MongoStore outside of tests (MONGODB_URI not available in test env)
if (process.env.NODE_ENV !== 'test') {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 1 * 24 * 60 * 60, // Sessions will expire in 1 day
    touchAfter: 24 * 60 * 60, // Update the session only once every 24 hours
    autoRemove: 'native', // Let MongoDB handle the cleanup
  });
}

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

app.use('/events', eventRouter);
app.use('/users', userRouter);
app.use('/comments', commentRouter);
app.use('/organizations', organizationRouter);
app.use('/interests', interestRouter);
app.use('/image', cloudinaryRouter);
app.use('/auth', googleAuthRouter);

// Root route
app.get('/', (req, res) => {
  res.send('see github for instructions to use db');
});

// 404 handler — must be after all routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler — must be last middleware (4 args)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
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
