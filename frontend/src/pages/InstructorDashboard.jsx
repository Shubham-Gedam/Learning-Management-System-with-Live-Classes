
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchMyCourses() {
    try {
      setError("");
      const response = await api.get("/courses/my");
      setCourses(response.data.courses || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your courses."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMyCourses();
  }, []);

  async function handlePublish(course) {
    const confirmed = window.confirm(
      `Are you sure you want to publish "${course.title}"?`
    );

    if (!confirmed) return;

    try {
      setPublishingId(course._id);
      setError("");
      setMessage("");

      await api.patch(`/courses/${course._id}`, {
        status: "published",
      });

      setCourses((previousCourses) =>
        previousCourses.map((item) =>
          item._id === course._id
            ? { ...item, status: "published" }
            : item
        )
      );

      setMessage(`"${course.title}" published successfully!`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to publish the course. Please try again."
      );
    } finally {
      setPublishingId("");
    }
  }

  return (
    <main className="page-container">
      <h1>Instructor Dashboard</h1>
      <p>Manage your courses and learning content.</p>

      <section className="dashboard-actions">
        <div className="dashboard-card">
          <h2>Create Course</h2>
          <p>Create a new course for your students.</p>
          <Link
            to="/instructor/create-course"
            className="register-btn"
          >
            Create Course
          </Link>
        </div>

        <div className="dashboard-card">
          <h2>Upload Video</h2>
          <p>Upload and process videos for your courses.</p>
          <Link
            to="/instructor/upload"
            className="register-btn"
          >
            Upload Video
          </Link>
        </div>

        <div className="dashboard-card">
          <h2>Browse Courses</h2>
          <p>View published courses on LearnHub.</p>
          <Link to="/courses" className="register-btn">
            View Courses
          </Link>
        </div>
      </section>

      <section className="my-courses-section">
        <h2>My Courses</h2>
        <p>Manage the courses you have created.</p>

        {loading && <p>Loading your courses...</p>}

        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="success-message">
            {message}
          </p>
        )}

        {!loading && !error && courses.length === 0 && (
          <p>You haven't created any courses yet.</p>
        )}

        <div className="dashboard-actions">
          {courses.map((course) => (
            <article className="dashboard-card" key={course._id}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>

              <p>
                <strong>Status:</strong>{" "}
                {course.status === "published"
                  ? "Published"
                  : "Draft"}
              </p>

              <p>
                <strong>Price:</strong>{" "}
                {Number(course.price) === 0
                  ? "Free"
                  : `₹${course.price}`}
              </p>

              {course.status === "draft" && (
                <button
                  type="button"
                  className="register-btn"
                  onClick={() => handlePublish(course)}
                  disabled={publishingId === course._id}
                >
                  {publishingId === course._id
                    ? "Publishing..."
                    : "Publish Course"}
                </button>
              )}

              {course.status === "published" && (
                <p>✓ This course is published.</p>
              )}

              <div style={{ marginTop: "12px" }}>
                <Link
                  to="/instructor/upload"
                  className="register-btn"
                >
                  Upload Video
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
