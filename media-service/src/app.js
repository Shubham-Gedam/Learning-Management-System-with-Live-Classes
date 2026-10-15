import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import mediaRoutes from "./routes/media.route.js";

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
    message: "Media Service is running",
    status: "success",
  });
});
app.use("/uploads/videos",express.static(path.resolve("uploads/videos")));
app.use("/uploads/processed",express.static(path.resolve("uploads/processed")));
app.use("/api/media", mediaRoutes);

export default app;