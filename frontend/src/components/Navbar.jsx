
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        LearnHub
      </Link>

      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/courses">Courses</NavLink>
        <NavLink to="/my-courses">My Learning</NavLink>
        <NavLink to="/classes">Live Classes</NavLink>
        <NavLink to="/login">Login</NavLink>

        <Link to="/register" className="register-btn">
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
