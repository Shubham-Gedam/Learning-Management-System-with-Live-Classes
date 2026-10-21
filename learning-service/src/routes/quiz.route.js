
import express from "express";

import {
  createQuizController,
  getLessonQuizzesController,
  updateQuizPublishController,
} from "../controllers/quiz.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Get published quizzes for a lesson
router.get("/lesson/:lessonId", getLessonQuizzesController);

// Create a quiz (Instructor/Admin)
router.post(
  "/",
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  createQuizController
);

// Publish/unpublish quiz (Admin)
router.patch(
  "/:quizId/publish",
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  updateQuizPublishController
);

export default router;
