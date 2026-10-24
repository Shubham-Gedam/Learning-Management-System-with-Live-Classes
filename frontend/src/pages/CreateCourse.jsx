
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

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

      // ID backend generate karta hai; instructor ko manually dene ki zaroorat nahi.
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
    <main className="create-course-page">
      <Link to="/instructor/dashboard" className="create-course-back">
        ← Back to Dashboard
      </Link>

      <header className="create-course-heading">
        <span className="create-course-eyebrow">INSTRUCTOR STUDIO</span>
        <h1>Create a new course</h1>
        <p>
          Share your expertise with learners. Add the course details
          below to get started.
        </p>
      </header>

      <form className="create-course-card" onSubmit={handleSubmit}>
        <div className="create-course-section-title">
          <div>
            <h2>Course information</h2>
            <p>Tell students what your course is about.</p>
          </div>
          <span>01 / 01</span>
        </div>

        <div className="create-course-field">
          <label htmlFor="title">Course title *</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Complete MERN Stack Development"
            required
          />
        </div>

        <div className="create-course-field">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What will students learn in this course?"
            rows={5}
            required
          />
        </div>

        <div className="create-course-grid">
          <div className="create-course-field">
            <label htmlFor="category">Category *</label>
            <input
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Web Development"
              required
            />
          </div>

          <div className="create-course-field">
            <label htmlFor="level">Difficulty level</label>
            <select
              id="level"
              name="level"
              value={form.level}
              onChange={handleChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="create-course-grid">
          <div className="create-course-field">
            <label htmlFor="price">Price (₹) *</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={handleChange}
              placeholder="0"
              required
            />
            <small>Enter 0 for a free course.</small>
          </div>

          <div className="create-course-field">
            <label htmlFor="thumbnail">Thumbnail URL</label>
            <input
              id="thumbnail"
              name="thumbnail"
              type="url"
              value={form.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="create-course-note">
          <span>✦</span>
          <p>
            Your course ID will be generated automatically when you
            create the course.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className={`create-course-message ${
              success ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          className="create-course-submit"
          disabled={loading}
        >
          {loading ? "Creating course..." : "Create Course →"}
        </button>
      </form>
    </main>
  );
}
