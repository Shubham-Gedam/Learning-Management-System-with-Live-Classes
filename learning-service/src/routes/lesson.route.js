
import express from "express";

import {
  createLessonController,
  getCourseLessonsController,
  updateLessonPublishController,
} from "../controllers/lesson.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Public: get published lessons for a course
router.get("/course/:courseId", getCourseLessonsController);

// Instructor/Admin: create a lesson
router.post(
  "/",
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  createLessonController
);

// Admin: publish or unpublish a lesson
router.patch(
  "/:lessonId/publish",
  authMiddleware,
  authorizeRoles("admin"),
  updateLessonPublishController
);

export default router;
