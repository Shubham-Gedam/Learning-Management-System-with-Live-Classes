import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUpcomingClasses,
  createLiveClass,
  joinLiveClass,
} from "../services/liveClass.service";

function Classes() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const canManageClasses =
    user?.role === "instructor" || user?.role === "admin";
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    courseId: "",
    scheduledAt: "",
    durationMinutes: "60",
  });

  async function fetchClasses() {
    try {
      setError("");
      const response = await getUpcomingClasses();
      console.log("Upcoming classes API response:", response.data);
      setClasses(response.data.data ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load upcoming live classes.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (new Date(form.scheduledAt) <= new Date()) {
      setError("Please select a future date and time.");
      return;
    }

    try {
      setSaving(true);

      await createLiveClass({
        title: form.title.trim(),
        description: form.description.trim(),
        courseId: form.courseId.trim(),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        durationMinutes: Number(form.durationMinutes),
      });

      setMessage("Live class scheduled successfully!");

      setForm({
        title: "",
        description: "",
        courseId: "",
        scheduledAt: "",
        durationMinutes: "60",
      });

      await fetchClasses();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to schedule the live class.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function handleJoin(liveClass) {
    try {
      setError("");
      setMessage("");

      const response = await joinLiveClass(liveClass._id);
      const { serverUrl, token } = response.data.data;

      localStorage.setItem(
        "liveClassConnection",
        JSON.stringify({
          serverUrl,
          token,
          classId: liveClass._id,
          title: liveClass.title,
        }),
      );

      navigate("/live-room");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to join the live class.");
    }
  }

  return (
    <main className="hero">
      <span className="eyebrow">LEARN TOGETHER, LIVE</span>

      <h1>
        Manage your
        <br />
        <span>Live Classes.</span>
      </h1>

      <p>Schedule a session or view upcoming classes.</p>
      {canManageClasses && (
        <section>
          <h2>Schedule a Live Class</h2>
          <p>Instructor/Admin only. Your backend will verify your role.</p>

          <form onSubmit={handleSubmit}>
            <p>
              <label htmlFor="title">Class title</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Introduction to Node.js"
                required
              />
            </p>

            <p>
              <label htmlFor="description">Description</label>
              <input
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What will students learn?"
              />
            </p>

            <p>
              <label htmlFor="courseId">Course ID</label>
              <input
                id="courseId"
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                placeholder="Paste the course ID"
                required
              />
            </p>

            <p>
              <label htmlFor="scheduledAt">Date and time</label>
              <input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </p>

            <p>
              <label htmlFor="durationMinutes">Duration (minutes)</label>
              <input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                min="1"
                step="1"
                value={form.durationMinutes}
                onChange={handleChange}
                required
              />
            </p>

            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? "Scheduling..." : "Schedule Class"}
            </button>
          </form>
        </section>
      )}

      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}

      <section>
        <h2>Upcoming Classes</h2>

        {loading && <p>Loading live classes...</p>}

        {!loading && classes.length === 0 && (
          <p>No upcoming live classes are scheduled right now.</p>
        )}

        {classes.map((liveClass) => (
          <article key={liveClass._id} className="course-card">
            <h3>{liveClass.title}</h3>
            <p>{liveClass.description || "Live learning session"}</p>
            <p>
              <strong>Scheduled:</strong>{" "}
              {new Date(liveClass.scheduledAt).toLocaleString()}
            </p>
            <p>
              <strong>Duration:</strong> {liveClass.durationMinutes} minutes
            </p>
            <p>
              <strong>Status:</strong> {liveClass.status}
            </p>
            {liveClass.status === "live" &&
              (user?.role === "student" ||
                user?.role === "instructor" ||
                user?.role === "admin") && (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => handleJoin(liveClass)}
                >
                  Join Live Class
                </button>
              )}
          </article>
        ))}
      </section>
    </main>
  );
}

export default Classes;
