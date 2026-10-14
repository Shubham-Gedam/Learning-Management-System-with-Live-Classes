import liveClassModel from "../models/liveclass.model.js";

// Create a live class
export async function createLiveClassController(req, res) {
  try {
    const {
      title,
      description,
      courseId,
      scheduledAt,
      durationMinutes,
      meetingUrl,
    } = req.body;

    if (!title || !courseId || !scheduledAt) {
      return res.status(400).json({
        message: "Title, course ID and scheduled date are required",
        status: "failed",
      });
    }

    const scheduledDate = new Date(scheduledAt);

    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        message: "Invalid scheduled date",
        status: "failed",
      });
    }

    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        message: "Schedule the class for a future date and time",
        status: "failed",
      });
    }

    const classDuration = Number(durationMinutes ?? 60);

    if (!Number.isInteger(classDuration) || classDuration < 1) {
      return res.status(400).json({
        message: "Duration must be a positive whole number",
        status: "failed",
      });
    }

    const liveClass = await liveClassModel.create({
      title,
      description,
      courseId,
      instructorId: req.user.userId,
      scheduledAt: scheduledDate,
      durationMinutes: classDuration,
      meetingUrl,
    });

    return res.status(201).json({
      message: "Live class scheduled successfully",
      status: "success",
      data: liveClass,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to schedule live class",
      error: error.message,
      status: "failed",
    });
  }
}

// Get upcoming scheduled classes
export async function getUpcomingClassesController(req, res) {
  try {
    const classes = await liveClassModel
      .find({
        isActive: true,
        status: "scheduled",
        scheduledAt: { $gte: new Date() },
      })
      .sort({ scheduledAt: 1 });

    return res.status(200).json({
      message: "Upcoming live classes fetched successfully",
      status: "success",
      results: classes.length,
      data: classes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch upcoming classes",
      status: "failed",
    });
  }
}

// Get classes created by the logged-in instructor
export async function getMyLiveClassesController(req, res) {
  try {
    const filter = {
      isActive: true,
      instructorId: req.user.userId,
    };

    const classes = await liveClassModel
      .find(filter)
      .sort({ scheduledAt: 1 });

    return res.status(200).json({
      message: "Your live classes fetched successfully",
      status: "success",
      results: classes.length,
      data: classes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch your live classes",
      status: "failed",
    });
  }
}

// Update live class status
export async function updateLiveClassStatusController(req, res) {
  try {
    const { status } = req.body;

    const allowedStatuses = ["live", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid live class status",
        status: "failed",
      });
    }

    const liveClass = await liveClassModel.findOne({
      _id: req.params.classId,
      isActive: true,
    });

    if (!liveClass) {
      return res.status(404).json({
        message: "Live class not found",
        status: "failed",
      });
    }

    if (
      liveClass.instructorId !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You cannot update this live class",
        status: "failed",
      });
    }

    if (liveClass.status === "completed" || liveClass.status === "cancelled") {
      return res.status(400).json({
        message: "This live class has already ended or been cancelled",
        status: "failed",
      });
    }

    liveClass.status = status;
    await liveClass.save();

    return res.status(200).json({
      message: "Live class status updated successfully",
      status: "success",
      data: liveClass,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid live class ID",
        status: "failed",
      });
    }

    return res.status(500).json({
      message: "Failed to update live class status",
      status: "failed",
    });
  }
}