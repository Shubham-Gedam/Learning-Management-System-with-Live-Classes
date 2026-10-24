
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <Link to="/" className="footer-brand">
          LearnSphere
        </Link>

        <p>Learn new skills. Build your future.</p>

        <nav className="footer-links" aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/classes">Live Classes</Link>
        </nav>

        <p className="footer-copyright">
          © {new Date().getFullYear()} LearnSphere. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
