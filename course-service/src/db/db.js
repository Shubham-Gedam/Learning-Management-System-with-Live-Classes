import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Course Service MongoDB connected");
  } catch (error) {
    console.error("Error connecting to Course Service MongoDB:", error.message);
    process.exit(1);
  }
}

export default connectDB;