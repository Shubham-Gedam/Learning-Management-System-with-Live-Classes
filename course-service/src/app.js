import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import courseRoutes from "./routes/cource.route.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  return res.status(200).json({
    message: "Course Service is running",
    status: "success",
  });
});

app.use("/api/courses", courseRoutes);

export default app;