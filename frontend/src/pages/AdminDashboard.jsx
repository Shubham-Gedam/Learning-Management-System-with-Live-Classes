import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { ShieldAlert, Users, BookOpen, GraduationCap, TrendingUp, Sparkles, AlertCircle, Edit3, Trash2, X, Check } from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();

  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCourses, setTotalCourses] = useState(null);
  const [enrollmentStats, setEnrollmentStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [adminCourses, setAdminCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  function handleEditCourse(course) {
    setEditingCourse(course);
  }

  async function handleDeactivateCourse(courseId) {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this course?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/courses/${courseId}`);

      setAdminCourses((courses) =>
        courses.filter((course) => course._id !== courseId),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to deactivate course");
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    async function fetchAdminStats() {
      try {
        const response = await api.get("/admin/stats");
        setUserStats(response.data.data);
        const coursesResponse = await api.get("/courses");
        const coursesData = coursesResponse.data;

        const adminCoursesResponse = await api.get("/courses/admin/all");
        setAdminCourses(adminCoursesResponse.data.courses);

        const count =
          coursesData.totalCourses ??
          coursesData.data?.totalCourses ??
          coursesData.courses?.length ??
          coursesData.data?.courses?.length;

        setTotalCourses(count ?? 0);
        
        // Fetch enrollment statistics
        const enrollmentResponse = await api.get("/learning/admin/stats");
        setEnrollmentStats(enrollmentResponse.data.data);
        
        // Fetch recent users
        const recentUsersResponse = await api.get("/admin/recent-users");
        setRecentUsers(recentUsersResponse.data.data.users);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load admin statistics",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAdminStats();
  }, [navigate, user?.role]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans px-6 lg:px-16 py-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center md:text-left space-y-2 border-b border-neutral-900 pb-6">
          <span className="text-orange-500 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center md:justify-start gap-2">
            <ShieldAlert className="w-4 h-4" /> SYSTEM ADMINISTRATION
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-neutral-400">
            Welcome back, <strong className="text-white">{user.name || "Admin"}</strong>! Manage platform users, courses, and system telemetry.
          </p>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-orange-500 font-bold text-sm animate-pulse gap-2">
            <Sparkles className="w-5 h-5" /> Loading admin telemetry...
          </div>
        )}

        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Telemetry Metrics Grid */}
        {!loading && !error && userStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Users</span>
                <p className="text-3xl font-black text-white">{userStats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Students</span>
                <p className="text-3xl font-black text-amber-500">{userStats.students}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Instructors</span>
                <p className="text-3xl font-black text-teal-400">{userStats.instructors}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Admins</span>
                <p className="text-3xl font-black text-rose-400">{userStats.admins}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Courses</span>
                <p className="text-3xl font-black text-white">{totalCourses === null ? "—" : totalCourses}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Enrollments</span>
                <p className="text-3xl font-black text-white">{enrollmentStats?.totalEnrollments ?? "—"}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Active Enrollments</span>
                <p className="text-3xl font-black text-emerald-400">{enrollmentStats?.activeEnrollments ?? "—"}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Check className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Completed</span>
                <p className="text-3xl font-black text-purple-400">{enrollmentStats?.completedEnrollments ?? "—"}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

          </div>
        )}

        {/* Recent Users Section */}
        <section className="space-y-6 pt-6 border-t border-neutral-900">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" /> Recent Platform Users
            </h2>
          </div>

          {recentUsers.length === 0 ? (
            <div className="text-center py-12 bg-[#141414] border border-neutral-800 rounded-2xl">
              <p className="text-neutral-400 text-xs">No users found.</p>
            </div>
          ) : (
            <div className="bg-[#141414] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                    {recentUsers.map((recentUser) => (
                      <tr key={recentUser._id} className="hover:bg-neutral-900/50 transition">
                        <td className="p-4 font-bold text-white">{recentUser.name}</td>
                        <td className="p-4 text-neutral-400">{recentUser.email}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            {recentUser.role}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-400">
                          {recentUser.createdAt
                            ? new Date(recentUser.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Course Management Section */}
        <section className="space-y-6 pt-6 border-t border-neutral-900">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-500" /> Course Management Control
            </h2>
          </div>

          {adminCourses.length === 0 ? (
            <div className="text-center py-12 bg-[#141414] border border-neutral-800 rounded-2xl">
              <p className="text-neutral-400 text-xs">No courses found.</p>
            </div>
          ) : (
            <div className="bg-[#141414] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Course</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Level</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                    {adminCourses.map((course) => (
                      <tr key={course._id} className="hover:bg-neutral-900/50 transition">
                        <td className="p-4 font-bold text-white">{course.title}</td>
                        <td className="p-4 text-neutral-400">{course.category}</td>
                        <td className="p-4 font-mono text-white">₹{course.price ?? 0}</td>
                        <td className="p-4 text-neutral-400 capitalize">{course.level || "—"}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            course.status === "published" 
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {course.status || "Unknown"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEditCourse(course)}
                              className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-orange-500" /> Edit
                            </button>

                            <button
                              onClick={() => handleDeactivateCourse(course._id)}
                              className="bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Deactivate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Edit Course Modal Overlay */}
        {editingCourse && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#141414] border border-neutral-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
              
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-orange-500" /> Edit Course Details
                </h3>
                <button 
                  onClick={() => setEditingCourse(null)}
                  className="text-neutral-400 hover:text-white p-1 rounded-lg bg-neutral-900 border border-neutral-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  try {
                    const response = await api.patch(
                      `/courses/${editingCourse._id}`,
                      {
                        title: editingCourse.title,
                        description: editingCourse.description,
                        category: editingCourse.category,
                        price: Number(editingCourse.price),
                        level: editingCourse.level,
                        status: editingCourse.status,
                      },
                    );

                    setAdminCourses((courses) =>
                      courses.map((course) =>
                        course._id === editingCourse._id
                          ? { ...course, ...response.data.course }
                          : course,
                      ),
                    );

                    setEditingCourse(null);
                    alert("Course updated successfully");
                  } catch (err) {
                    alert(err.response?.data?.message || "Failed to update course");
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Course Title</label>
                  <input
                    value={editingCourse.title || ""}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, title: e.target.value })
                    }
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Description</label>
                  <textarea
                    value={editingCourse.description || ""}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        description: e.target.value,
                      })
                    }
                    required
                    rows={4}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-orange-500 transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">Category</label>
                    <input
                      value={editingCourse.category || ""}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, category: e.target.value })
                      }
                      required
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editingCourse.price ?? 0}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, price: e.target.value })
                      }
                      required
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">Level</label>
                    <select
                      value={editingCourse.level || "beginner"}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, level: e.target.value })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">Status</label>
                    <select
                      value={editingCourse.status || "draft"}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, status: e.target.value })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                  <button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-lg shadow-orange-600/20"
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingCourse(null)}
                    className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 font-semibold px-6 py-3.5 rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;