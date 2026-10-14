
import express from "express";

import {
  submitQuizAttemptController,
  getMyQuizAttemptsController,
} from "../controllers/quizAttempt.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Student submits answers and receives an automatically graded result
router.post(
  "/:quizId/submit",
  authMiddleware,
  submitQuizAttemptController
);

// Get the logged-in student's attempts for a quiz
router.get(
  "/:quizId/my-attempts",
  authMiddleware,
  getMyQuizAttemptsController
);

export default router;
