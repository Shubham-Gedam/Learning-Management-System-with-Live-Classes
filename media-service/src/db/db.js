import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Media Service MongoDB connected");
  } catch (error) {
    console.error("Media Service DB error:", error.message);
    process.exit(1);
  }
}

export default connectDB;