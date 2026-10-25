import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCourses, setTotalCourses] = useState(null);
  const [enrollmentStats, setEnrollmentStats] = useState(null);

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    async function fetchAdminStats() {
      try {
        const response = await api.get("/admin/stats");
        setUserStats(response.data.data);
        const coursesResponse = await api.get("/courses");
        const coursesData = coursesResponse.data;

        const count =
          coursesData.totalCourses ??
          coursesData.data?.totalCourses ??
          coursesData.courses?.length ??
          coursesData.data?.courses?.length;

        setTotalCourses(count ?? 0);
        const enrollmentResponse = await api.get("/learning/admin/stats");
        setEnrollmentStats(enrollmentResponse.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load admin statistics",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAdminStats();
  }, [navigate, user?.role]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name || "Admin"}!</p>
      <p>Manage your Learning Management System from here.</p>

      {loading && <p>Loading dashboard statistics...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && userStats && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Total Users</h3>
            <p>{userStats.totalUsers}</p>
          </div>

          <div className="dashboard-card">
            <h3>Students</h3>
            <p>{userStats.students}</p>
          </div>

          <div className="dashboard-card">
            <h3>Instructors</h3>
            <p>{userStats.instructors}</p>
          </div>

          <div className="dashboard-card">
            <h3>Admins</h3>
            <p>{userStats.admins}</p>
          </div>
          <div className="dashboard-card">
            <h3>Total Courses</h3>
            <p>{totalCourses === null ? "—" : totalCourses}</p>
          </div>
          <div className="dashboard-card">
            <h3>Total Enrollments</h3>
            <p>{enrollmentStats?.totalEnrollments ?? "—"}</p>
          </div>

          <div className="dashboard-card">
            <h3>Active Enrollments</h3>
            <p>{enrollmentStats?.activeEnrollments ?? "—"}</p>
          </div>

          <div className="dashboard-card">
            <h3>Completed Enrollments</h3>
            <p>{enrollmentStats?.completedEnrollments ?? "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
