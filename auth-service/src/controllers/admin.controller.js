import userModel from "../models/User.model.js";

export async function getAdminStatsController(req, res) {
  try {
    const [totalUsers, students, instructors, admins] = await Promise.all([
      userModel.countDocuments(),
      userModel.countDocuments({ role: "student" }),
      userModel.countDocuments({ role: "instructor" }),
      userModel.countDocuments({ role: "admin" }),
    ]);

    return res.status(200).json({
      status: "success",
      data: {
        totalUsers,
        students,
        instructors,
        admins,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);

    return res.status(500).json({
      status: "failed",
      message: "Failed to fetch admin statistics",
    });
  }
}

// Admin: Get latest registered users
export async function getRecentUsersController(req, res) {
  try {
    const users = await userModel
      .find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      status: "success",
      data: { users },
    });
  } catch (error) {
    console.error("Recent users error:", error.message);

    return res.status(500).json({
      status: "failed",
      message: "Failed to fetch recent users",
    });
  }
}