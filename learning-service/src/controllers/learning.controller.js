import enrollmentModel from "../models/enrollment.model.js";
import lessonModel from "../models/Lesson.model.js";

// 1. Enroll in a course
export async function enrollCourseController(req, res) {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
        status: "failed",
      });
    }

    const existingEnrollment = await enrollmentModel.findOne({
      student: req.user.userId,
      courseId,
    });

    if (existingEnrollment) {
      return res.status(409).json({
        message: "You are already enrolled in this course",
        status: "failed",
      });
    }

    const enrollment = await enrollmentModel.create({
      student: req.user.userId,
      courseId,
    });

    return res.status(201).json({
      message: "Course enrolled successfully",
      status: "success",
      data: enrollment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You are already enrolled in this course",
        status: "failed",
      });
    }

    return res.status(500).json({
      message: "Failed to enroll in course",
      error: error.message,
      status: "failed",
    });
  }
}

// 2. Get logged-in student's enrollments
export async function getMyEnrollmentsController(req, res) {
  try {
    const enrollments = await enrollmentModel
      .find({ student: req.user.userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Enrollments fetched successfully",
      status: "success",
      results: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch enrollments",
      error: error.message,
      status: "failed",
    });
  }
}

// 3. Get one enrollment
export async function getEnrollmentByIdController(req, res) {
  try {
    const enrollment = await enrollmentModel.findOne({
      _id: req.params.enrollmentId,
      student: req.user.userId,
    });

    if (!enrollment) {
      return res.status(404).json({
        message: "Enrollment not found",
        status: "failed",
      });
    }

    return res.status(200).json({
      message: "Enrollment fetched successfully",
      status: "success",
      data: enrollment,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid enrollment ID",
        status: "failed",
      });
    }

    return res.status(500).json({
      message: "Failed to fetch enrollment",
      status: "failed",
    });
  }
}

// 4. Mark a lesson as completed

export async function completeLessonController(req, res) {
  try {
    const { lessonId } = req.body;
    const { enrollmentId } = req.params;

    if (!lessonId || typeof lessonId !== "string" || !lessonId.trim()) {
      return res.status(400).json({
        message: "Lesson ID is required",
        status: "failed",
      });
    }

    const enrollment = await enrollmentModel.findOne({
      _id: enrollmentId,
      student: req.user.userId,
    });

    if (!enrollment) {
      return res.status(404).json({
        message: "Enrollment not found",
        status: "failed",
      });
    }

    if (enrollment.status === "completed") {
      return res.status(400).json({
        message: "This course is already completed",
        status: "failed",
      });
    }

    // Verify that the lesson belongs to this course
    // and is published.
    const lesson = await lessonModel.findOne({
      _id: lessonId.trim(),
      courseId: enrollment.courseId,
      isPublished: true,
    });

    if (!lesson) {
      return res.status(404).json({
        message: "Published lesson not found in this course",
        status: "failed",
      });
    }

    const completedLessonId = lesson._id.toString();

    // Avoid duplicate lesson completion.
    if (!enrollment.completedLessons.includes(completedLessonId)) {
      enrollment.completedLessons.push(completedLessonId);
    }

    // Count all published lessons in this course.
    const totalLessons = await lessonModel.countDocuments({
      courseId: enrollment.courseId,
      isPublished: true,
    });

    // Count only completed lessons that belong to this course.
    const completedLessonsCount = await lessonModel.countDocuments({
      _id: { $in: enrollment.completedLessons },
      courseId: enrollment.courseId,
      isPublished: true,
    });

    enrollment.progress =
      totalLessons > 0
        ? Math.round((completedLessonsCount / totalLessons) * 100)
        : 0;

    // Mark the enrollment completed when all lessons are done.
    if (totalLessons > 0 && completedLessonsCount >= totalLessons) {
      enrollment.progress = 100;
      enrollment.status = "completed";
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    return res.status(200).json({
      message:
        enrollment.status === "completed"
          ? "Course completed successfully"
          : "Lesson marked as completed",
      status: "success",
      data: enrollment,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid enrollment ID or lesson ID",
        status: "failed",
      });
    }

    return res.status(500).json({
      message: "Failed to complete lesson",
      error: error.message,
      status: "failed",
    });
  }
}
