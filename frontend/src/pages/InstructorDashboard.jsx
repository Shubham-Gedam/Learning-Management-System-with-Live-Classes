import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import paymentService from "../services/payment.service";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [earnings, setEarnings] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [earningsError, setEarningsError] = useState("");

  async function fetchMyCourses() {
    try {
      setError("");
      const response = await api.get("/courses/my");
      setCourses(response.data.courses || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your courses.");
    } finally {
      setLoading(false);
    }
  }
  const fetchInstructorEarnings = async () => {
    try {
      setEarningsLoading(true);
      setEarningsError("");

      const response = await paymentService.getInstructorEarnings();

      if (response.status === "success") {
        setEarnings(response.data);
      }
    } catch (error) {
      setEarningsError(
        error.response?.data?.message || "Failed to load instructor earnings",
      );
    } finally {
      setEarningsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
    fetchInstructorEarnings();
  }, []);

  async function handlePublish(course) {
    const confirmed = window.confirm(
      `Are you sure you want to publish "${course.title}"?`,
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
          item._id === course._id ? { ...item, status: "published" } : item,
        ),
      );

      setMessage(`"${course.title}" published successfully!`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to publish the course. Please try again.",
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
          <Link to="/instructor/create-course" className="register-btn">
            Create Course
          </Link>
        </div>

        <div className="dashboard-card">
          <h2>Upload Video</h2>
          <p>Upload and process videos for your courses.</p>
          <Link to="/instructor/upload" className="register-btn">
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
        <h2>Instructor Earnings</h2>
        <p>Track your course sales and earnings.</p>

        {earningsLoading && <p>Loading earnings...</p>}

        {earningsError && (
          <p role="alert" className="error-message">
            {earningsError}
          </p>
        )}

        {!earningsLoading && earnings && (
          <>
            <div className="dashboard-actions">
              <div className="dashboard-card">
                <h3>Total Earnings</h3>
                <h2>
                  ₹
                  {Number(earnings.totalEarnings || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h2>
              </div>

              <div className="dashboard-card">
                <h3>Total Sales</h3>
                <h2>{earnings.totalSales || 0}</h2>
              </div>
            </div>

            <h3>Course-wise Earnings</h3>

            {earnings.courses?.length === 0 ? (
              <p>No course earnings available yet.</p>
            ) : (
              <div className="dashboard-actions">
                {earnings.courses?.map((course) => (
                  <article className="dashboard-card" key={course.courseId}>
                    <h3>{course.title}</h3>
                    <p>
                      <strong>Sales:</strong> {course.totalSales}
                    </p>
                    <p>
                      <strong>Earnings:</strong> ₹
                      {Number(course.totalEarnings || 0).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
