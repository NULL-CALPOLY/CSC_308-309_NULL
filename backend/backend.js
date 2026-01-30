import mongoose from 'mongoose';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables FIRST before importing any routes
config({ path: path.resolve(process.cwd(), '.env') });

import express from 'express';
import eventRouter from './EventFiles/EventRoutes.js';
import userRouter from './UserFiles/UserRoutes.js';
import loginRouter from './CredentialFiles/LoginRoutes.js';
import chatRouter from './ChatFiles/ChatRoutes.js';
import organizationRouter from './OrganizationFiles/OrganizationRoutes.js';
import interestRouter from './InterestFIles/InterestRoutes.js';
import cors from 'cors';
import googleAuthRouter from './OAuth/GoogleAuthRoutes.js';
import passport from 'passport';
import session from 'express-session';

// Intialize Express app
const app = express();
const port = /*process.env.PORT*/ 3000; // if want your own port, just uncomment. Otherwise, default is 3000

// Middleware
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'some-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/events', eventRouter);
app.use('/users', userRouter);
app.use('/organizations', organizationRouter);
app.use('/logins', loginRouter);
app.use('/chats', chatRouter);
app.use('/interests', interestRouter);
app.use('/auth', googleAuthRouter);

// Start the server
app.get('/', (req, res) => {
  res.send('see github for instructions to use db');
});

// Start listening on port
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});

// Get MongoDB URI from environment variable
const uri = process.env.MONGODB_URI;

// Connect to MongoDB (non-blocking)
if (process.env.NODE_ENV !== 'test') {
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

export default app;
