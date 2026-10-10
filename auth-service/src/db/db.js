import mongoose from "mongoose";

 async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Auth Service MongoDB connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
 }

export default connectDB;