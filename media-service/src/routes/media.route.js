import express from "express";

import {
  createMediaController,
  getAllMediaController,
  getMediaByIdController,
  deleteMediaController,
} from "../controllers/media.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Public read endpoints
router.get("/", getAllMediaController);
router.get("/:mediaId", getMediaByIdController);

// Authenticated write endpoints
router.post("/", authMiddleware, authorizeRoles("instructor", "admin"), createMediaController);
router.delete("/:mediaId", authMiddleware, authorizeRoles("instructor", "admin"), deleteMediaController);

export default router;