import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Setup path to .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.resolve(__dirname, "..", ".env") });

// Get MongoDB URI from environment variable
const uri = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

export default mongoose;
