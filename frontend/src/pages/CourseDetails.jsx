import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:3002/api/courses/${courseId}`)
      .then((response) => {
        const data = response.data;
        setCourse(data.course || data.data?.course || data.data || data);
      })
      .catch((err) => {
        console.error(err);
        setError("Course details load nahi hui.");
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return <main className="page">Loading course...</main>;
  }

  if (error || !course?._id) {
    return (
      <main className="page">
        <h2>{error || "Course not found"}</h2>
        <Link to="/courses">← Back to Courses</Link>
      </main>
    );
  }

  return (
    <main className="page course-details">
      <Link to="/courses">← Back to Courses</Link>

      <span className="course-category">{course.category}</span>

      <h1>{course.title}</h1>

      <p>{course.description}</p>

      <div className="course-meta">
        <span>Level: {course.level}</span>
        <strong>{course.price === 0 ? "Free" : `₹${course.price}`}</strong>
      </div>

      <button
        className="primary-btn"
        disabled={enrolling}
        onClick={async () => {
          const user = JSON.parse(localStorage.getItem("user") || "null");

          if (!user) {
            navigate("/login");
            return;
          }

          if (course.price > 0) {
            navigate(`/checkout/${course._id}`);
            return;
          }

          setEnrolling(true);
          setEnrollError("");

          try {
            await axios.post(
              "http://localhost:3003/api/learning/enroll",
              { courseId: course._id },
              { withCredentials: true },
            );

            alert("Course enrolled successfully!");
            navigate("/my-courses");
          } catch (err) {
            setEnrollError(
              err.response?.data?.message ||
                "Enrollment failed. Please try again.",
            );
          } finally {
            setEnrolling(false);
          }
        }}
      >
        {enrolling
          ? "Enrolling..."
          : course.price === 0
            ? "Enroll Now"
            : "Buy Now"}
      </button>

      {enrollError && <p className="error-message">{enrollError}</p>}
    </main>
  );
}
