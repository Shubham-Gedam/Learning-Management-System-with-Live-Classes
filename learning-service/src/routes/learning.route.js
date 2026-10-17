import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { internalServiceMiddleware } from "../middleware/internalService.middleware.js";

import * as learningController from "../controllers/learning.controller.js";

const router = express.Router();

router.get("/verify-enrollment", internalServiceMiddleware, learningController.verifyCourseEnrollmentController);

router.use(authMiddleware);

router.post("/enroll", learningController.enrollCourseController);
router.get("/my-courses", learningController.getMyEnrollmentsController);

router.get("/:enrollmentId",learningController.getEnrollmentByIdController);

router.patch("/:enrollmentId/complete-lesson",learningController.completeLessonController);

export default router;