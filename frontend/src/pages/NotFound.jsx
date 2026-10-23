
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="hero">
      <span className="eyebrow">404 — PAGE NOT FOUND</span>

      <h1>
        Lost your way?
        <br />
        <span>Let's get you learning.</span>
      </h1>

      <p>
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <div className="hero-actions">
        <Link to="/" className="primary-btn">
          Go Home
        </Link>

        <Link to="/courses" className="secondary-btn">
          Explore Courses
        </Link>
      </div>
    </main>
  );
}

export default NotFound;
