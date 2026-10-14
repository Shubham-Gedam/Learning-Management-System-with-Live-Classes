import mongoose from "mongoose";
import quizModel from "../models/Quiz.model.js";
import lessonModel from "../models/Lesson.model.js";
import { verifyCourseOwnership } from "../utils/courseOwnership.js";

// 1. Create a quiz (Instructor/Admin)
export async function createQuizController(req, res) {
  try {
    const {
      courseId,
      lessonId,
      title,
      description,
      questions,
      passingMarks,
    } = req.body;

    if (
      !courseId?.trim() ||
      !lessonId?.trim() ||
      !title?.trim() ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        message: "Course ID, lesson ID, title and questions are required",
        status: "failed",
      });
    }

    if (!mongoose.isValidObjectId(lessonId)) {
      return res.status(400).json({
        message: "Invalid lesson ID",
        status: "failed",
      });
    }

    const lesson = await lessonModel.findOne({
      _id: lessonId,
      courseId: courseId.trim(),
    });

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found in this course",
        status: "failed",
      });
    }
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
      message: "You can only create quizzes for your own courses",
      status: "failed",
    });
  }
}

    if (
      passingMarks !== undefined &&
      (!Number.isFinite(passingMarks) || passingMarks < 0)
    ) {
      return res.status(400).json({
        message: "Passing marks must be a non-negative number",
        status: "failed",
      });
    }

    const quiz = await quizModel.create({
      courseId: courseId.trim(),
      lessonId: lessonId.trim(),
      title: title.trim(),
      description,
      questions,
      passingMarks,
      isPublished: false,
    });

    return res.status(201).json({
      message: "Quiz created successfully",
      status: "success",
      data: quiz,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
        status: "failed",
      });
    }

    return res.status(500).json({
      message: "Failed to create quiz",
      error: error.message,
      status: "failed",
    });
  }
}

// 2. Get published quizzes for a lesson (Student)
export async function getLessonQuizzesController(req, res) {
  try {
    const { lessonId } = req.params;

    if (!mongoose.isValidObjectId(lessonId)) {
      return res.status(400).json({
        message: "Invalid lesson ID",
        status: "failed",
      });
    }

    const quizzes = await quizModel
      .find({ lessonId, isPublished: true })
      .select("-questions.correctAnswer")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      message: "Lesson quizzes fetched successfully",
      status: "success",
      results: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch quizzes",
      status: "failed",
    });
  }
}

// 3. Publish or unpublish a quiz (Admin)
export async function updateQuizPublishController(req, res) {
  try {
    const { quizId } = req.params;
    const { isPublished } = req.body;

    if (!mongoose.isValidObjectId(quizId)) {
      return res.status(400).json({
        message: "Invalid quiz ID",
        status: "failed",
      });
    }

    if (typeof isPublished !== "boolean") {
      return res.status(400).json({
        message: "isPublished must be true or false",
        status: "failed",
      });
    }

    const quiz = await quizModel.findByIdAndUpdate(
      quizId,
      { isPublished },
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
        status: "failed",
      });
    }

    return res.status(200).json({
      message: `Quiz ${isPublished ? "published" : "unpublished"} successfully`,
      status: "success",
      data: quiz,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update quiz status",
      status: "failed",
    });
  }
}
