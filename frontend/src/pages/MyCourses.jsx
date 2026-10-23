import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { issueCertificate } from "../services/certificate.service";

export default function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [issuingCertificate, setIssuingCertificate] = useState("");

  useEffect(() => {
    async function fetchMyCourses() {
      try {
        const response = await axios.get(
          "http://localhost:3003/api/learning/my-courses",
          { withCredentials: true },
        );

        const enrollments = response.data.data || [];

        const results = await Promise.all(
          enrollments.map(async (enrollment) => {
            try {
              const courseResponse = await axios.get(
                `http://localhost:3002/api/courses/${enrollment.courseId}`,
                { withCredentials: true },
              );

              return {
                ...enrollment,
                course: courseResponse.data.course,
              };
            } catch (err) {
              console.error("Course details error:", err);
              return { ...enrollment, course: null };
            }
          }),
        );

        setCourses(results);
      } catch (err) {
        console.error("My courses error:", err);
        setError(err.response?.data?.message || "Failed to load your courses.");
      } finally {
        setLoading(false);
      }
    }

    fetchMyCourses();
  }, []);
  async function handleGetCertificate(enrollment) {
    try {
      setError("");
      setIssuingCertificate(enrollment._id);

      const response = await issueCertificate(enrollment.courseId, {
        studentName: JSON.parse(localStorage.getItem("user") || "{}").name,
        courseName: enrollment.course?.title,
      });

      const certificate = response.data?.data;

      if (!certificate?.certificateId) {
        throw new Error("Certificate ID was not returned by the server.");
      }

      navigate(`/certificate/${certificate.certificateId}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to issue certificate.",
      );
    } finally {
      setIssuingCertificate("");
    }
  }

  if (loading) {
    return (
      <main className="page">
        <h2>Loading your courses...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <h2>{error}</h2>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>My Learning</h1>
      <p>Your enrolled courses and learning progress.</p>

      {courses.length === 0 ? (
        <p>You haven't enrolled in any courses yet.</p>
      ) : (
        <div className="course-grid">
          {courses.map((enrollment) => (
            <article className="course-card" key={enrollment._id}>
              <span className="course-category">
                {enrollment.course?.category || "Course"}
              </span>

              <h2>
                {enrollment.course?.title || "Course details unavailable"}
              </h2>

              <p>{enrollment.course?.description || ""}</p>

              <div className="course-meta">
                <span>{enrollment.status || "Enrolled"}</span>
                <strong>{enrollment.progress ?? 0}%</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${enrollment.progress ?? 0}%`,
                  }}
                />
              </div>

              <Link
                to={`/learn/${enrollment.courseId}`}
                className="primary-button"
                style={{
                  display: "inline-block",
                  marginTop: 16,
                  textDecoration: "none",
                }}
              >
                Continue Learning →
              </Link>
              {enrollment.status === "completed" &&
                Number(enrollment.progress) >= 100 && (
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => handleGetCertificate(enrollment)}
                    disabled={issuingCertificate === enrollment._id}
                    style={{ marginTop: 16, marginLeft: 8 }}
                  >
                    {issuingCertificate === enrollment._id
                      ? "Generating Certificate..."
                      : "Get Certificate"}
                  </button>
                )}
            </article>
          ))}
        </div>
      )}

      <p style={{ marginTop: 24 }}>
        <Link to="/courses">Explore more courses →</Link>
      </p>
    </main>
  );
}
