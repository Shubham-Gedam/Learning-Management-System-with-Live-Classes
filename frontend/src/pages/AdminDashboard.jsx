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
  const [recentUsers, setRecentUsers] = useState([]);
  const [adminCourses, setAdminCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }
  function handleEditCourse(course) {
    setEditingCourse(course);
  }

  async function handleDeactivateCourse(courseId) {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this course?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/courses/${courseId}`);

      setAdminCourses((courses) =>
        courses.filter((course) => course._id !== courseId),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to deactivate course");
    }
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

        const adminCoursesResponse = await api.get("/courses/admin/all");
        setAdminCourses(adminCoursesResponse.data.courses);

        const count =
          coursesData.totalCourses ??
          coursesData.data?.totalCourses ??
          coursesData.courses?.length ??
          coursesData.data?.courses?.length;

        setTotalCourses(count ?? 0);
        // Fetch enrollment statistics
        const enrollmentResponse = await api.get("/learning/admin/stats");
        setEnrollmentStats(enrollmentResponse.data.data);
        // Fetch recent users
        const recentUsersResponse = await api.get("/admin/recent-users");
        setRecentUsers(recentUsersResponse.data.data.users);
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
      <div className="recent-users-section">
        <h2>Recent Users</h2>

        {recentUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="recent-users-table-wrapper">
            <table className="recent-users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered</th>
                </tr>
              </thead>

              <tbody>
                {recentUsers.map((recentUser) => (
                  <tr key={recentUser._id}>
                    <td>{recentUser.name}</td>
                    <td>{recentUser.email}</td>
                    <td>{recentUser.role}</td>
                    <td>
                      {recentUser.createdAt
                        ? new Date(recentUser.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="recent-users-section">
        <h2>Course Management</h2>

        {adminCourses.length === 0 ? (
          <p>No courses found.</p>
        ) : (
          <div className="recent-users-table-wrapper">
            <table className="recent-users-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {adminCourses.map((course) => (
                  <tr key={course._id}>
                    <td>{course.title}</td>
                    <td>{course.category}</td>
                    <td>₹{course.price ?? 0}</td>
                    <td>{course.level || "—"}</td>
                    <td>
                      <span
                        className={`course-status-badge ${course.status || "unknown"}`}
                      >
                        {course.status || "Unknown"}
                      </span>
                    </td>
                    <td>
                      <div className="course-action-buttons">
                        <button onClick={() => handleEditCourse(course)}>
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeactivateCourse(course._id)}
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingCourse && (
        <div className="course-edit-form">
          <h3>Edit Course</h3>

          <form
            onSubmit={async (e) => {
              e.preventDefault();

              try {
                const response = await api.patch(
                  `/courses/${editingCourse._id}`,
                  {
                    title: editingCourse.title,
                    description: editingCourse.description,
                    category: editingCourse.category,
                    price: Number(editingCourse.price),
                    level: editingCourse.level,
                    status: editingCourse.status,
                  },
                );

                setAdminCourses((courses) =>
                  courses.map((course) =>
                    course._id === editingCourse._id
                      ? { ...course, ...response.data.course }
                      : course,
                  ),
                );

                setEditingCourse(null);
                alert("Course updated successfully");
              } catch (err) {
                alert(err.response?.data?.message || "Failed to update course");
              }
            }}
          >
            <label>Course Title</label>
            <input
              value={editingCourse.title || ""}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, title: e.target.value })
              }
              required
            />

            <label>Description</label>
            <textarea
              value={editingCourse.description || ""}
              onChange={(e) =>
                setEditingCourse({
                  ...editingCourse,
                  description: e.target.value,
                })
              }
              required
            />

            <label>Category</label>
            <input
              value={editingCourse.category || ""}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, category: e.target.value })
              }
              required
            />

            <label>Price</label>
            <input
              type="number"
              min="0"
              value={editingCourse.price ?? 0}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, price: e.target.value })
              }
              required
            />

            <label>Level</label>
            <select
              value={editingCourse.level || "beginner"}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, level: e.target.value })
              }
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <label>Status</label>
            <select
              value={editingCourse.status || "draft"}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, status: e.target.value })
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditingCourse(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
