import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/db/db.js";



connectDB();

app.listen(3003, () => {
  console.log("Learning Service running on port 3003");
});
