import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUpcomingClasses,
  createLiveClass,
  joinLiveClass,
  updateLiveClassStatus,
} from "../services/liveClass.service";
import api from "../services/api";
import { Video, Calendar, Clock, PlusCircle, PlayCircle, Sparkles, CheckCircle, AlertCircle, UserCheck } from "lucide-react";

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
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans px-6 lg:px-16 py-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center md:text-left space-y-3 border-b border-neutral-900 pb-8">
          <span className="text-orange-500 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center md:justify-start gap-2">
            <Video className="w-4 h-4" /> LEARN TOGETHER, LIVE
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Manage your <span className="text-orange-500">Live Classes</span>
          </h1>
          <p className="text-sm text-neutral-400">
            Schedule interactive live sessions or join upcoming classroom broadcasts.
          </p>
        </div>

        {/* Status Alerts */}
        {message && (
          <div role="status" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {message}
          </div>
        )}

        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* INSTRUCTOR / ADMIN SECTION: Schedule Class Form */}
        {canManageClasses && (
          <section className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-neutral-800/80 pb-4">
              <PlusCircle className="w-5 h-5 text-orange-500" />
              <div>
                <h2 className="text-lg font-bold text-white">Schedule a Live Class</h2>
                <p className="text-xs text-neutral-400">Choose one of your assigned courses and schedule a live stream session.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Class Title */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="title" className="text-xs font-semibold text-neutral-300">Class Title *</label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Introduction to Node.js & Express Architecture"
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="description" className="text-xs font-semibold text-neutral-300">Description</label>
                <input
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="What key concepts will students learn in this live broadcast?"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              {/* Select Course */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="courseId" className="text-xs font-semibold text-neutral-300">Associated Course *</label>
                <select
                  id="courseId"
                  name="courseId"
                  value={form.courseId}
                  onChange={handleChange}
                  required
                  disabled={loadingCourses || courses.length === 0}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition disabled:opacity-50"
                >
                  <option value="">
                    {loadingCourses
                      ? "Loading your courses..."
                      : courses.length === 0
                        ? "No courses available"
                        : "Choose a course for this live session"}
                  </option>

                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>

                {!loadingCourses && courses.length === 0 && (
                  <p className="text-[11px] text-amber-500/90 pt-1">
                    No courses found for your account. Ensure you are logged in as the course instructor.
                  </p>
                )}
              </div>

              {/* Date and Time */}
              <div className="space-y-1.5">
                <label htmlFor="scheduledAt" className="text-xs font-semibold text-neutral-300">Date & Time *</label>
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
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label htmlFor="durationMinutes" className="text-xs font-semibold text-neutral-300">Duration (Minutes) *</label>
                <input
                  id="durationMinutes"
                  name="durationMinutes"
                  type="number"
                  min="1"
                  step="1"
                  value={form.durationMinutes}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="bg-gradient-to from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-6 py-3.5 rounded-xl text-xs transition-all duration-300 shadow-lg shadow-orange-600/20 disabled:opacity-50"
                  disabled={saving || loadingCourses || courses.length === 0}
                >
                  {saving ? "Scheduling Session..." : "Schedule Live Class"}
                </button>
              </div>

            </form>
          </section>
        )}

        {/* UPCOMING CLASSES LIST */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" /> Upcoming Broadcasts
            </h2>
            <span className="text-xs text-neutral-400">{classes.length} Sessions Available</span>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16 text-orange-500 font-bold text-sm animate-pulse gap-2">
              <Sparkles className="w-5 h-5" /> Loading live classes...
            </div>
          )}

          {!loading && classes.length === 0 && (
            <div className="text-center py-16 bg-[#141414] border border-neutral-800 rounded-2xl">
              <p className="text-neutral-400 text-xs">No live classes are scheduled right now.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((liveClass) => {
              const currentStatus = getClassStatus(liveClass);

              return (
                <article key={liveClass._id} className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-5 hover:border-orange-500/40 transition-all shadow-xl">
                  
                  <div className="space-y-3">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        currentStatus === "live"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
                          : currentStatus === "scheduled"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-neutral-800 text-neutral-400"
                      }`}>
                        {currentStatus === "live" ? "🔴 LIVE NOW" : currentStatus}
                      </span>

                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" /> {liveClass.durationMinutes} mins
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{liveClass.title}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                      {liveClass.description || "Interactive live learning session with Q&A."}
                    </p>

                    <div className="text-xs text-neutral-300 pt-2 border-t border-neutral-800/60">
                      <strong className="text-neutral-500 uppercase text-[10px] block mb-0.5">Scheduled Date & Time</strong>
                      {new Date(liveClass.scheduledAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2">
                    {canManageClasses &&
                      currentStatus === "scheduled" &&
                      liveClass.status !== "cancelled" && (
                        <button
                          type="button"
                          className="w-full bg-gradient-to from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-orange-600/20 flex items-center justify-center gap-2"
                          onClick={() => handleStart(liveClass)}
                        >
                          <PlayCircle className="w-4 h-4" /> Start Live Class
                        </button>
                      )}

                    {currentStatus === "live" &&
                      ["student", "instructor", "admin"].includes(user?.role) && (
                        <button
                          type="button"
                          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-rose-600/20 animate-pulse flex items-center justify-center gap-2"
                          onClick={() => handleJoin(liveClass)}
                        >
                          <Video className="w-4 h-4" /> Join Live Class Now
                        </button>
                      )}
                  </div>

                </article>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Classes;