import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Live Class Service MongoDB connected");
  } catch (error) {
    console.error("Live Class DB error:", error.message);
    process.exit(1);
  }
}

export default connectDB;