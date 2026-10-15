import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/db/db.js";



connectDB();

app.listen(3005, () => {
  console.log("Live Class Service is running on port 3005");
})

