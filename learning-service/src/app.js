import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import learningRoutes from "./routes/learning.route.js";

const app = express();

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5173",
//     credentials: true,
//   })
// );

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  return res.status(200).json({
    message: "Learning Service is running",
    status: "success",
  });
});

app.use("/api/learning", learningRoutes);

export default app;