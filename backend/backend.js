import mongoose from 'mongoose';
import path from 'path';
import { config } from 'dotenv';
import express from 'express';
import eventRouter from './EventFiles/EventRoutes.js';
import userRouter from './UserFiles/UserRoutes.js';
import loginRouter from './CredentialFiles/LoginRoutes.js';
import chatRouter from './ChatFiles/ChatRoutes.js';
import organizationRouter from './OrganizationFiles/OrganizationRoutes.js';
import cors from 'cors';

// Intialize Express app
const app = express();
const port = /*process.env.PORT*/ 3000; // if want your own port, just uncomment. Otherwise, default is 3000

// Middleware
app.use(cors());
app.use(express.json());
app.use('/events', eventRouter);
app.use('/users', userRouter);
app.use('/organizations', organizationRouter);
app.use('/logins', loginRouter);
app.use('/chats', chatRouter);

// Load environment variables (use process.cwd() so this file works under tests)
config({ path: path.resolve(process.cwd(), '.env') });

// Get MongoDB URI from environment variable
const uri = process.env.MONGODB_URI;

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(uri) // The two defaults weren't needed in latest version of mongoose
    .then(() => {
      console.log('✅ Connected to MongoDB');
      app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
      });
    })
    .catch((error) => console.error('❌ MongoDB connection error:', error));
}

// Start the server
app.get('/', (req, res) => {
  res.send('see github for instructions to use db');
});

export default app;
