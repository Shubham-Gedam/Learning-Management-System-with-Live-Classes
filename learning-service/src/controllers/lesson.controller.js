
import mongoose from "mongoose";
import lessonModel from "../models/Lesson.model.js";
import { verifyCourseOwnership } from "../utils/courseOwnership.js";

// 1. Create a lesson (instructor/admin)
export async function createLessonController(req, res) {
  try {
    const {
      courseId,
      title,
      description,
      videoUrl,
      durationSeconds,
      order,
      isPublished,
    } = req.body;

    if (!courseId || !title || !title.trim()) {
      return res.status(400).json({
        message: "Course ID and lesson title are required",
        status: "failed",
      });
    }

    if (!Number.isInteger(order) || order < 1) {
      return res.status(400).json({
        message: "Lesson order must be a positive integer",
        status: "failed",
      });
    }
    // Verify that the instructor owns this course.
if (req.user.role === "instructor") {
  const ownership = await verifyCourseOwnership(
    courseId.trim(),
    req.user.userId
  );

  if (!ownership.exists) {
    return res.status(404).json({
      message: "Course not found",
      status: "failed",
    });
  }

  if (!ownership.isOwner) {
    return res.status(403).json({
      message: "You can only create lessons for your own courses",
      status: "failed",
    });
  }
}

    if (
      durationSeconds !== undefined &&
      (!Number.isFinite(durationSeconds) || durationSeconds < 0)
    ) {
      return res.status(400).json({
        message: "Duration must be a non-negative number",
        status: "failed",
      });
    }

    const lesson = await lessonModel.create({
      courseId,
      title: title.trim(),
      description,
      videoUrl,
      durationSeconds,
      order,
      isPublished: req.user.role === "admin" ? Boolean(isPublished) : false,
    });

    return res.status(201).json({
      message: "Lesson created successfully",
      status: "success",
      data: lesson,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This lesson order already exists for the course",
        status: "failed",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
        status: "failed",
      });
    }

    return res.status(500).json({
      message: "Failed to create lesson",
      error: error.message,
      status: "failed",
    });
  }
}

// 2. Get published lessons for a course
export async function getCourseLessonsController(req, res) {
  try {
    const { courseId } = req.params;

    if (!courseId || !courseId.trim()) {
      return res.status(400).json({
        message: "Course ID is required",
        status: "failed",
      });
    }

    const lessons = await lessonModel
      .find({ courseId, isPublished: true })
      .sort({ order: 1 });

    return res.status(200).json({
      message: "Course lessons fetched successfully",
      status: "success",
      results: lessons.length,
      data: lessons,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch course lessons",
      status: "failed",
    });
  }
}

// 3. Publish or unpublish a lesson (admin only)
export async function updateLessonPublishController(req, res) {
  try {
    const { lessonId } = req.params;
    const { isPublished } = req.body;

    if (!mongoose.isValidObjectId(lessonId)) {
      return res.status(400).json({
        message: "Invalid lesson ID",
        status: "failed",
      });
    }

    if (typeof isPublished !== "boolean") {
      return res.status(400).json({
        message: "isPublished must be true or false",
        status: "failed",
      });
    }

    const lesson = await lessonModel.findByIdAndUpdate(
      lessonId,
      { isPublished },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
        status: "failed",
      });
    }

    return res.status(200).json({
      message: `Lesson ${isPublished ? "published" : "unpublished"} successfully`,
      status: "success",
      data: lesson,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update lesson",
      status: "failed",
    });
  }
}
