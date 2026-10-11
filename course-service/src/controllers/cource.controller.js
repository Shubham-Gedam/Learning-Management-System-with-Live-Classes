import courseModel from "../models/course.model.js";

export async function createCourseController(req, res) {
  try {
    const {title, description, category, thumbnail, price, level, status } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title, description and category are required",
        status: "failed",
      });
    }

    const course = await courseModel.create({
      title,
      description,
      category,
      thumbnail,
      price,
      level,
      status,
      instructor: req.user.userId,
    });

    return res.status(201).json({
      course,
      message: "Course created successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Create course error:", error.message);

    return res.status(500).json({
      message: "Failed to create course",
      status: "failed",
    });
  }
}

// 2. Get All Published Courses
export async function getAllCoursesController(req, res) {
  try {
    const courses = await courseModel.find({
      status: "published",
      isActive: true,
    });

    return res.status(200).json({
      totalCourses: courses.length,
      courses,
      message: "Courses fetched successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Get courses error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch courses",
      status: "failed",
    });
  }
}

// 3. Get Single Course
export async function getCourseByIdController(req, res) {
  try {
    const { courseId } = req.params;

    const course = await courseModel.findOne({
      _id: courseId,
      status: "published",
      isActive: true,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        status: "failed",
      });
    }

    return res.status(200).json({
      course,
      message: "Course fetched successfully",
      status: "success",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid course ID",
        status: "failed",
      });
    }

    console.error("Get course error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch course",
      status: "failed",
    });
  }
}

// 4. Update Course
export async function updateCourseController(req, res) {
  try {
    const { courseId } = req.params;

    const course = await courseModel.findById(courseId);

    if (!course || !course.isActive) {
      return res.status(404).json({
        message: "Course not found",
        status: "failed",
      });
    }

    // Sirf course ka owner instructor update kar sakta hai
    if (course.instructor !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to update this course",
        status: "failed",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "thumbnail",
      "price",
      "level",
      "status",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        course.set(field, req.body[field]);
      }
    }

    await course.save();

    return res.status(200).json({
      course,
      message: "Course updated successfully",
      status: "success",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid course ID",
        status: "failed",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
        status: "failed",
      });
    }

    console.error("Update course error:", error.message);

    return res.status(500).json({
      message: "Failed to update course",
      status: "failed",
    });
  }
}

// 5. Delete Course (Soft Delete)
export async function deleteCourseController(req, res) {
  try {
    const { courseId } = req.params;

    const course = await courseModel.findById(courseId);

    if (!course || !course.isActive) {
      return res.status(404).json({
        message: "Course not found",
        status: "failed",
      });
    }

    // Sirf course ka owner instructor delete kar sakta hai
    if (course.instructor !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this course",
        status: "failed",
      });
    }

    course.isActive = false;
    await course.save();

    return res.status(200).json({
      message: "Course deleted successfully",
      status: "success",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid course ID",
        status: "failed",
      });
    }

    console.error("Delete course error:", error.message);

    return res.status(500).json({
      message: "Failed to delete course",
      status: "failed",
    });
  }
}