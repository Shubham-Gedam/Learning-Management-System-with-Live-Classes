import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/db/db.js";



connectDB();

app.listen(3004, () => {
  console.log("Media Service is running on port 3004");
})

