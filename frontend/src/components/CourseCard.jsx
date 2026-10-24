
import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  if (!course) return null;

  return (
    <article className="course-card">
      <span className="course-category">
        {course.category || "General"}
      </span>

      <h2>
        <Link to={`/courses/${course._id}`}>
          {course.title || "Untitled Course"}
        </Link>
      </h2>

      <p>{course.description || "Explore this course to learn more."}</p>

      <div className="course-meta">
        <span>{course.level || "All Levels"}</span>

        <strong>
          {Number(course.price) === 0
            ? "Free"
            : `₹${Number(course.price).toLocaleString("en-IN")}`}
        </strong>
      </div>
    </article>
  );
}
