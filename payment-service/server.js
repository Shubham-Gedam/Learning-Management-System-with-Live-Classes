import "dotenv/config";
console.log(
  "Razorpay Key ID loaded:",
  Boolean(process.env.RAZORPAY_KEY_ID)
);

import app from "./src/app.js";
import {connectDB} from "./src/db/db.js";

connectDB();


app.listen(3006, () => {
  console.log(`Payment Service running on port 3006`);
});