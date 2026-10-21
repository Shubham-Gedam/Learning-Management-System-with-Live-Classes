import express from "express";
import * as paymentController from "../controllers/payment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/create-order",authMiddleware,authorizeRoles("student"), paymentController.createOrder);
router.post("/verify-payment",authMiddleware,authorizeRoles("student"), paymentController.verifyPayment);
router.post("/retry-enrollment",authMiddleware,authorizeRoles("student"),paymentController.retryEnrollment);

export default router;