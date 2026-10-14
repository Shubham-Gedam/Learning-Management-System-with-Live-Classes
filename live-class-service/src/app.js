import express from "express";
import cookieParser from "cookie-parser";

import liveClassRoutes from "./routes/liveClass.route.js";

const app = express();


app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  return res.status(200).json({
    message: "Live Class Service is running",
    status: "success",
  });
});

app.use("/api/live-classes", liveClassRoutes);

export default app;