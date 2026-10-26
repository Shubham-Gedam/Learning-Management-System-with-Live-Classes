import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#0B0B0B] border-t border-slate-800/80 text-slate-400 py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="text-2xl font-black tracking-tight text-white flex items-center gap-2 group"
        >
          <span>Learn<span className="text-green-400 group-hover:text-green-300 transition-colors">Sphere</span></span>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
        </Link>

        {/* Subtitle */}
        <p className="text-sm text-slate-400 max-w-sm">
          Learn new skills, master modern tech stacks, and build your future.
        </p>

        {/* Footer Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-300" aria-label="Footer navigation">
          <Link to="/" className="hover:text-green-400 transition-colors">Home</Link>
          <Link to="/courses" className="hover:text-green-400 transition-colors">Courses</Link>
          <Link to="/classes" className="hover:text-green-400 transition-colors">Live Classes</Link>
        </nav>

        {/* Divider Line */}
        <div className="w-full h-px bg-slate-800/60 max-w-md my-2"></div>

        {/* Copyright */}
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} LearnSphere. All rights reserved.
        </p>
      </div>
    </footer>
  );
}