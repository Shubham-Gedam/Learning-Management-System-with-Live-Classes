import express from "express";

import * as certificateCotroller from "../controllers/certificate.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Issue a certificate (authenticated user)
router.post("/issue", authMiddleware, certificateCotroller.issueCertificate);

// Get logged-in student's certificates
router.get("/my-certificates",authMiddleware,certificateCotroller.getMyCertificates,);

// Public certificate verification
router.get("/verify/:certificateId", certificateCotroller.verifyCertificate);

router.get("/:certificateId/download",authMiddleware, certificateCotroller.downloadCertificatePDF,);

export default router;
