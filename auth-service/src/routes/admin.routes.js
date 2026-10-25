import express from "express";
import adminMiddleware from "../middleware/admin.middleware.js";
import { getAdminStatsController } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/stats", adminMiddleware, getAdminStatsController);

export default router;