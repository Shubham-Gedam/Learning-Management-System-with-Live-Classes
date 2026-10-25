import express from "express";
import adminMiddleware from "../middleware/admin.middleware.js";
import { getAdminStatsController, getRecentUsersController } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/stats", adminMiddleware, getAdminStatsController);
router.get("/recent-users", adminMiddleware, getRecentUsersController);

export default router;