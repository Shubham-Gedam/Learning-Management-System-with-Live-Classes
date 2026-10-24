import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUpcomingClasses,
  createLiveClass,
  joinLiveClass,
  updateLiveClassStatus,
} from "../services/liveClass.service";
import api from "../services/api";

function Classes() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const canManageClasses =
    user?.role === "instructor" || user?.role === "admin";

  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
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

  function getClassStatus(liveClass) {
    const startTime = new Date(liveClass.scheduledAt).getTime();
    const duration = Number(liveClass.durationMinutes);

    if (
      !Number.isFinite(startTime) ||
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return liveClass.status;
    }

    const endTime = startTime + duration * 60 * 1000;

    if (liveClass.status === "cancelled") return "cancelled";
    if (Date.now() < startTime) return "scheduled";
    if (Date.now() >= endTime) return "ended";

    return "live";
  }

  async function fetchClasses() {
    try {
      setError("");
      const response = await getUpcomingClasses();
      setClasses(response.data.data ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load upcoming live classes.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchCourses() {
    try {
      setLoadingCourses(true);

      const response = await api.get("/courses");
      const allCourses = response.data.courses || [];
      const userId = user?._id || user?.id;

      const availableCourses =
        user?.role === "admin"
          ? allCourses
          : allCourses.filter((course) => {
              const instructorId =
                typeof course.instructor === "object"
                  ? course.instructor?._id
                  : course.instructor;

              return userId && String(instructorId) === String(userId);
            });

      setCourses(availableCourses);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your courses.");
    } finally {
      setLoadingCourses(false);
    }
  }

  useEffect(() => {
    fetchClasses();

    if (canManageClasses) {
      fetchCourses();
    }
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

    if (!form.courseId) {
      setError("Please select a course.");
      return;
    }

    if (new Date(form.scheduledAt) <= new Date()) {
      setError("Please select a future date and time.");
      return;
    }

    try {
      setSaving(true);

      await createLiveClass({
        title: form.title.trim(),
        description: form.description.trim(),
        courseId: form.courseId,
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
  async function handleStart(liveClass) {
    try {
      setError("");
      setMessage("");

      await updateLiveClassStatus(liveClass._id, "live");

      setMessage("Live class started successfully.");

      await fetchClasses();

      await handleJoin({
        ...liveClass,
        status: "live",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to start the live class.",
      );
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
          <p>Choose one of your courses and schedule a live session.</p>

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
              <label htmlFor="courseId">Select course</label>
              <select
                id="courseId"
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                required
                disabled={loadingCourses || courses.length === 0}
              >
                <option value="">
                  {loadingCourses
                    ? "Loading your courses..."
                    : courses.length === 0
                      ? "No courses available"
                      : "Choose a course"}
                </option>

                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>

              {!loadingCourses && courses.length === 0 && (
                <small>
                  No courses found for your account. Check that you are logged
                  in as the instructor who created the course.
                </small>
              )}
            </p>

            <p>
              <label htmlFor="scheduledAt">Date and time</label>
              <input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={handleChange}
                min={new Date(
                  Date.now() - new Date().getTimezoneOffset() * 60000,
                )
                  .toISOString()
                  .slice(0, 16)}
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

            <button
              type="submit"
              className="primary-btn"
              disabled={saving || loadingCourses || courses.length === 0}
            >
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
          <p>No live classes are scheduled right now.</p>
        )}

        {classes.map((liveClass) => {
          const currentStatus = getClassStatus(liveClass);

          return (
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
                <strong>Status:</strong> {currentStatus}
              </p>

              {canManageClasses &&
                currentStatus === "scheduled" &&
                liveClass.status !== "cancelled" && (
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => handleStart(liveClass)}
                  >
                    Start Live Class
                  </button>
                )}

              {currentStatus === "live" &&
                ["student", "instructor", "admin"].includes(user?.role) && (
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => handleJoin(liveClass)}
                  >
                    Join Live Class
                  </button>
                )}
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default Classes;
