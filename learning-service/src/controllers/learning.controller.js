import enrollmentModel from "../models/enrollment.model.js";

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

    if (!enrollment.completedLessons.includes(lessonId.trim())) {
      enrollment.completedLessons.push(lessonId.trim());
    }

    // Progress is based on completed lesson IDs.
    // Exact percentage requires the total lesson count from Course/Learning content.
    enrollment.progress = Math.min(
      99,
      enrollment.completedLessons.length
    );

    await enrollment.save();

    return res.status(200).json({
      message: "Lesson marked as completed",
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
      message: "Failed to complete lesson",
      error: error.message,
      status: "failed",
    });
  }
}