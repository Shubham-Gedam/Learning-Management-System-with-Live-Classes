import Certificate from "../models/certificate.model.js";
import mongoose from "mongoose";
import crypto from "crypto";
import axios from "axios";
import generateCertificatePDF from "../utils/generateCertificatePDF.js";

// Issue a certificate
export async function issueCertificate(req, res) {
  try {
    const { courseId, studentName, courseName, instructorName } = req.body;
    const studentId = req.user.userId;

    if (!courseId || !studentName?.trim() || !courseName?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "courseId, studentName and courseName are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid student ID or course ID",
      });
    }

    // Verify course enrollment and completion through Learning Service
    const response = await axios.get(
      `${process.env.LEARNING_SERVICE_URL}/api/learning/verify-enrollment`,
      {
        params: {
          studentId,
          courseId,
        },
        headers: {
          "x-internal-service-key": process.env.INTERNAL_SERVICE_SECRET,
        },
        timeout: 5000,
      }
    );

    const enrollment = response.data?.data;

    if (
      !enrollment?.isEnrolled ||
      enrollment.progress !== 100 ||
      enrollment.enrollmentStatus !== "completed" ||
      enrollment.isCompleted !== true
    ) {
      return res.status(403).json({
        status: "error",
        message: "Complete the course before requesting a certificate",
      });
    }

    // Prevent duplicate certificates
    const existingCertificate = await Certificate.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingCertificate) {
      return res.status(200).json({
        status: "success",
        message: "Certificate already exists",
        data: existingCertificate,
      });
    }

    const certificate = await Certificate.create({
      student: studentId,
      course: courseId,
      certificateId: `LMS-${crypto.randomUUID()}`,
      studentName: studentName.trim(),
      courseName: courseName.trim(),
      instructorName: instructorName?.trim() || "Instructor",
      completionPercentage: enrollment.progress,
    });

    return res.status(201).json({
      status: "success",
      message: "Certificate issued successfully",
      data: certificate,
    });
  } catch (error) {
    console.error(
      "Issue certificate error:",
      error.response?.data || error.message
    );

    if (error.response) {
      return res.status(502).json({
        status: "error",
        message: "Could not verify course completion",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to issue certificate",
    });
  }
}

// Get logged-in student's certificates
export async function getMyCertificates(req, res) {
  try {
    const studentId = req.user.userId;

    const certificates = await Certificate.find({
      student: studentId,
    }).sort({ issuedAt: -1 });

    return res.status(200).json({
      status: "success",
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    console.error("Get certificates error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch certificates",
    });
  }
}

// Verify a certificate publicly
export async function verifyCertificate(req, res) {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return res.status(404).json({
        status: "error",
        message: "Certificate not found or invalid",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Certificate is valid",
      data: {
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        instructorName: certificate.instructorName,
        issuedAt: certificate.issuedAt,
      },
    });
  } catch (error) {
    console.error("Verify certificate error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to verify certificate",
    });
  }
}
export async function downloadCertificatePDF(req, res) {
  try {
    const { certificateId } = req.params;
    const studentId = req.user.userId;

    const certificate = await Certificate.findOne({
      certificateId,
      student: studentId,
    });

    if (!certificate) {
      return res.status(404).json({
        status: "error",
        message: "Certificate not found or you do not have permission to download it",
      });
    }

    generateCertificatePDF(certificate, res);
  } catch (error) {
    console.error("Download certificate error:", error.message);

    if (!res.headersSent) {
      return res.status(500).json({
        status: "error",
        message: "Failed to generate certificate PDF",
      });
    }

    res.end();
  }
}