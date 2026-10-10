import express from "express";
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();


router.post('/register', authController.registerController)
router.post('/login', authController.loginController)
router.post('/logout', authController.userLogoutController)



export default router;