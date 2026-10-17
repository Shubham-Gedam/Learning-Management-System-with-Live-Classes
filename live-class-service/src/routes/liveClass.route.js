import express from "express";

import * as liveClassController from "../controllers/liveClass.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Public: view upcoming classes
router.get("/upcoming", liveClassController.getUpcomingClassesController);

// Instructor: view own classes
router.get("/my-classes",authMiddleware,authorizeRoles("instructor", "admin"),liveClassController.getMyLiveClassesController);

// Instructor/admin: schedule a class
router.post("/",authMiddleware,authorizeRoles("instructor", "admin"),liveClassController.createLiveClassController);

// Instructor/admin: update class status
router.patch("/:classId/status",authMiddleware,authorizeRoles("instructor", "admin"),liveClassController.updateLiveClassStatusController);

// Authenticated users can request a token for a live class
router.post("/:classId/join-token", authMiddleware, liveClassController.joinLiveClassController);

export default router;