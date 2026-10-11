import express from "express";
import * as courseController from "../controllers/cource.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Public routes: students bhi published courses dekh sakte hain
router.get("/", courseController.getAllCoursesController);
router.get("/:courseId", courseController.getCourseByIdController);

// Instructor-only routes
router.post(
  "/",
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  courseController.createCourseController
);

router.patch(
  "/:courseId",
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  courseController.updateCourseController
);

router.delete(
  "/:courseId",
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  courseController.deleteCourseController
);

export default router;