import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import connectDB from "./src/db/db.js";

connectDB();


app.listen(3007, () => {
  console.log(`Certificate Service running on port 3007`);
});