import express from "express";

import {
  createMediaController,
  getAllMediaController,
  getMediaByIdController,
  deleteMediaController,
  uploadVideoController,
  getVideoProcessingStatusController,
  attachMediaToLessonController
} from "../controllers/media.controller.js";
import upload from "../middleware/upload.middleware.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Public read endpoints
router.get("/", getAllMediaController);
router.get("/:mediaId/processing-status",authMiddleware,getVideoProcessingStatusController);
router.get("/:mediaId", getMediaByIdController);


router.post(
  "/upload",
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  upload.single("video"),
  uploadVideoController
);

// Authenticated write endpoints
router.post("/", authMiddleware, authorizeRoles("instructor", "admin"), createMediaController);
router.delete("/:mediaId", authMiddleware, authorizeRoles("instructor", "admin"), deleteMediaController);
router.patch("/:mediaId/lesson",authMiddleware,authorizeRoles("instructor", "admin"), attachMediaToLessonController);

export default router;