import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Sparkles, CheckCircle2, AlertCircle, BookPlus } from "lucide-react";

export default function CreateCourse() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "0",
    level: "beginner",
    thumbnail: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await api.post("/courses", {
        ...form,
        price: Number(form.price),
      });
      console.log("CREATE COURSE RESPONSE:", response.data);
      const course = response.data.data?.course || response.data.course || response.data.data;

      setSuccess(true);
      setMessage("Course created successfully!");

      if (course?._id) {
        setTimeout(() => navigate("/instructor/dashboard"), 1200);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Course creation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans px-6 lg:px-16 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link 
          to="/instructor/dashboard" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-orange-500 transition-colors uppercase tracking-wider bg-neutral-900/60 border border-neutral-800 px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header Heading */}
        <div className="space-y-2 border-b border-neutral-900 pb-6">
          <span className="text-orange-500 text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> INSTRUCTOR STUDIO
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Create a new course
          </h1>
          <p className="text-sm text-neutral-400">
            Share your expertise with learners. Add the course details below to get started.
          </p>
        </div>

        {/* Main Form Card Container */}
        <form className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl" onSubmit={handleSubmit}>
          
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookPlus className="w-4 h-4 text-orange-500" /> Course information
              </h2>
              <p className="text-xs text-neutral-400">Tell students what your course is about.</p>
            </div>
            <span className="text-xs text-neutral-500 font-mono">01 / 01</span>
          </div>

          {/* Title Field */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-semibold text-neutral-300">Course title *</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Complete MERN Stack Development"
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-semibold text-neutral-300">Description *</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What will students learn in this course?"
              rows={5}
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition resize-none"
            />
          </div>

          {/* Grid Row 1: Category & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="category" className="text-xs font-semibold text-neutral-300">Category *</label>
              <input
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Web Development"
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="level" className="text-xs font-semibold text-neutral-300">Difficulty level</label>
              <select
                id="level"
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Grid Row 2: Price & Thumbnail URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="price" className="text-xs font-semibold text-neutral-300">Price (₹) *</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition"
              />
              <small className="text-[11px] text-neutral-500 block">Enter 0 for a free course.</small>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="thumbnail" className="text-xs font-semibold text-neutral-300">Thumbnail URL</label>
              <input
                id="thumbnail"
                name="thumbnail"
                type="url"
                value={form.thumbnail}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          {/* Informational Note */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex items-center gap-3 text-xs text-neutral-400">
            <span className="text-orange-500 font-bold">✦</span>
            <p>Your course ID will be generated automatically when you create the course.</p>
          </div>

          {/* Status Message Display */}
          {message && (
            <div
              role="status"
              className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                success 
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              {success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-4 rounded-xl text-sm transition-all duration-300 shadow-xl shadow-orange-600/20 hover:scale-[1.01] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating course..." : "Create Course →"}
          </button>

        </form>

      </div>
    </div>
  );
}