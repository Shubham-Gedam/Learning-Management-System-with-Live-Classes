import { Link, NavLink, useNavigate } from "react-router-dom";
import { PhoneCall, User } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  function handleLogout() {
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  }

  const navLinkStyle = ({ isActive }) =>
    `transition-colors duration-200 text-sm font-medium ${
      isActive
        ? "text-orange-500 font-semibold"
        : "text-slate-300 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0B0B]/90 backdrop-blur-md border-b border-neutral-800 px-6 lg:px-12 h-20 flex items-center justify-between">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-500 font-bold text-lg">
          L
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-wider text-white leading-none">
            LearnHub
          </span>
          <span className="text-[10px] tracking-widest text-orange-500 font-semibold uppercase mt-0.5">
            Coding School
          </span>
        </div>
      </Link>

      {/* Center Pill Navigation (Sheryians Style) */}
      <div className="hidden md:flex items-center gap-8 bg-neutral-900/80 text-white border border-neutral-800 px-6 py-2.5 rounded-full shadow-inner">
        <NavLink to="/" className={navLinkStyle}>
          Home
        </NavLink>
        <NavLink to="/courses" className={navLinkStyle}>
          Courses
        </NavLink>
        <NavLink to="/classes" className={navLinkStyle}>
          Live Classes
        </NavLink>

        {user && role === "student" && (
          <NavLink to="/my-courses" className={navLinkStyle}>
            My Learning
          </NavLink>
        )}

        {user && role === "instructor" && (
          <>
            <NavLink to="/instructor/dashboard" className={navLinkStyle}>
              Dashboard
            </NavLink>
            <NavLink to="/instructor/upload" className={navLinkStyle}>
              Upload
            </NavLink>
          </>
        )}

        {user && role === "admin" && (
          <NavLink to="/admin/dashboard" className={navLinkStyle}>
            Admin
          </NavLink>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {!user ? (
          <>
            <Link
              to="/login"
              className="hidden sm:inline-block text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-all duration-200 shadow-lg shadow-orange-600/20 flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" /> Get Started
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-all duration-200 shadow-lg shadow-orange-600/20 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
