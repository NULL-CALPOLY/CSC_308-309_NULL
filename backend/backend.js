import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import express from 'express';
import userRouter from './UserFiles/UserRoutes.js';
import loginRouter from './UserFiles/Credentials/LoginRoutes.js';
import cors from 'cors';

// Intialize Express app
const app = express();
const port = /*process.env.PORT*/ 3000; // if want your own port, just uncomment. Otherwise, default is 3000

// Middleware
app.use(cors());
app.use(express.json());
app.use('/users', userRouter);
app.use('/logins', loginRouter);

// Setup path to .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.resolve(__dirname, '..', '.env') });

// Get MongoDB URI from environment variable
const uri = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose
  .connect(uri) // The two defaults weren't needed in latest version of mongoose
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// Start the server

app.get('/', (req, res) => {
  res.send('see github for instructions to use db');
});

export default mongoose;
