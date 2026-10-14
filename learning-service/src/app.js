import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import learningRoutes from "./routes/learning.route.js";
import lessonRoutes from "./routes/lesson.route.js";
import quizRoutes from "./routes/quiz.route.js";
import quizAttemptRoutes from "./routes/quizAttempt.route.js";

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
app.use("/api/lessons", lessonRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/quiz-attempts", quizAttemptRoutes);

export default app;