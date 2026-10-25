import express from "express";
import * as courseController from "../controllers/cource.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", courseController.getAllCoursesController);

// Instructor/Admin routes
router.get(
  "/my",
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  courseController.getMyCoursesController
);

// Get a single published course
router.get("/:courseId", courseController.getCourseByIdController);

// Create a course
router.post(
  "/",
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  courseController.createCourseController
);

// Update a course
router.patch(
  "/:courseId",
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  courseController.updateCourseController
);

// Delete a course
router.delete(
  "/:courseId",
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  courseController.deleteCourseController
);

router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles("admin"),
  courseController.getAllAdminCoursesController
);

export default router;