import { useEffect, useState } from "react";
import axios from "axios";
import CourseCard from "../components/CourseCard";

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
          <CourseCard key={course._id} course={course} />
        ))}
      </div>

      {courses.length === 0 && <p>No courses found.</p>}
    </main>
  );
}
