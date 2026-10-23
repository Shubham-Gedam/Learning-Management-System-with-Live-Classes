import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3002/api/courses")
      .then((response) => {
        console.log("Course API response:", response.data);
        setCourses(response.data.courses || []);
      })
      .catch((err) => {
        console.error("Course fetch error:", err);
        setError(err.message || "Failed to fetch courses");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="page">
        <h2>Loading courses...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <h2>Error: {error}</h2>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>Explore Courses</h1>
      <p>{courses.length} courses available</p>

      <div className="course-grid">
        {courses.map((course) => (
          <article className="course-card" key={course._id}>
            <span className="course-category">{course.category}</span>
            <h2>
              <Link to={`/courses/${course._id}`}>{course.title}</Link>
            </h2>
            <p>{course.description}</p>

            <div className="course-meta">
              <span>{course.level}</span>
              <strong>
                {course.price === 0 ? "Free" : `₹${course.price}`}
              </strong>
            </div>
          </article>
        ))}
      </div>

      {courses.length === 0 && <p>No courses found.</p>}
    </main>
  );
}
