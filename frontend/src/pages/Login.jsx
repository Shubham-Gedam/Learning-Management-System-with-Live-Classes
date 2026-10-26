import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/courses");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans flex items-center justify-center px-6 py-12 relative overflow-hidden">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-orange-600/10 blur-[130px] pointer-events-none rounded-full"></div>

      <div className="max-w-md w-full relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-500 font-bold text-lg">
              L
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg font-black tracking-wider text-white leading-none">LearnHub</span>
              <span className="text-[10px] tracking-widest text-orange-500 font-semibold uppercase mt-0.5">Coding School</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-white">Welcome back</h1>
          <p className="text-xs text-neutral-400">Login to continue your software engineering journey.</p>
        </div>

        {/* Auth Card Container */}
        <form className="bg-[#141414] border border-neutral-800 rounded-2xl p-8 space-y-6 shadow-2xl" onSubmit={handleSubmit}>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-orange-500" /> Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-orange-500" /> Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-4 rounded-xl text-sm transition-all duration-300 shadow-xl shadow-orange-600/20 hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Logging in..." : "Login to Dashboard"} <ArrowRight className="w-4 h-4" />
          </button>

          {/* Footer Register Link */}
          <p className="text-center text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
            Don't have an account?{" "}
            <Link to="/register" className="text-orange-500 font-bold hover:underline">
              Register here
            </Link>
          </p>

        </form>

      </div>
    </div>
  );
}