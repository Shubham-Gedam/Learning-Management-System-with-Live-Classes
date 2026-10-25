import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  function handleLogout() {
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        LearnHub
      </Link>

      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/courses">Courses</NavLink>

        {user && role === "student" && (
          <NavLink to="/my-courses">My Learning</NavLink>
        )}

        <NavLink to="/classes">Live Classes</NavLink>

        {user && role === "instructor" && (
          <>
            <NavLink to="/instructor/dashboard">Instructor Dashboard</NavLink>

            <NavLink to="/instructor/upload">Upload Video</NavLink>
          </>
        )}

        {user && role === "admin" && (
          <NavLink to="/admin/dashboard">Admin Dashboard</NavLink>
        )}

        {!user ? (
          <>
            <NavLink to="/login">Login</NavLink>

            <Link to="/register" className="register-btn">
              Get Started
            </Link>
          </>
        ) : (
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
