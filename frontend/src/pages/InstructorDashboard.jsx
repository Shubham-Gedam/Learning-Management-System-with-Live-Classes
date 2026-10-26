import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import paymentService from "../services/payment.service";
import { DollarSign, Users, BookOpen, PlusCircle, Video, HelpCircle, Sparkles, AlertCircle, ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [earnings, setEarnings] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [earningsError, setEarningsError] = useState("");

  async function fetchMyCourses() {
    try {
      setError("");
      const response = await api.get("/courses/my");
      setCourses(response.data.courses || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your courses.");
    } finally {
      setLoading(false);
    }
  }

  const fetchInstructorEarnings = async () => {
    try {
      setEarningsLoading(true);
      setEarningsError("");

      const response = await paymentService.getInstructorEarnings();

      if (response.status === "success") {
        setEarnings(response.data);
      }
    } catch (error) {
      setEarningsError(
        error.response?.data?.message || "Failed to load instructor earnings",
      );
    } finally {
      setEarningsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
    fetchInstructorEarnings();
  }, []);

  async function handlePublish(course) {
    const confirmed = window.confirm(
      `Are you sure you want to publish "${course.title}"?`,
    );

    if (!confirmed) return;

    try {
      setPublishingId(course._id);
      setError("");
      setMessage("");

      await api.patch(`/courses/${course._id}`, {
        status: "published",
      });

      setCourses((previousCourses) =>
        previousCourses.map((item) =>
          item._id === course._id ? { ...item, status: "published" } : item,
        ),
      );

      setMessage(`"${course.title}" published successfully!`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to publish the course. Please try again.",
      );
    } finally {
      setPublishingId("");
    }
  }

  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans px-6 lg:px-16 py-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center md:text-left space-y-2 border-b border-neutral-900 pb-6">
          <span className="text-orange-500 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-4 h-4" /> INSTRUCTOR PORTAL
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Instructor Dashboard
          </h1>
          <p className="text-sm text-neutral-400">
            Manage your curriculum content, monitor payouts, and publish courses seamlessly.
          </p>
        </div>

        {/* Global Notifications */}
        {message && (
          <div role="status" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}

        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Top Action Cards Grid */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-orange-500/50 transition-all shadow-xl group">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Create Course</h3>
                <p className="text-xs text-neutral-400">Create a new course curriculum for students.</p>
              </div>
              <Link to="/instructor/create-course" className="inline-block bg-neutral-900 hover:bg-orange-600 hover:text-black text-white border border-neutral-700 hover:border-orange-500 font-semibold px-4 py-2.5 rounded-xl text-xs text-center transition-all">
                Create Course →
              </Link>
            </div>

            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-orange-500/50 transition-all shadow-xl group">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Upload Video</h3>
                <p className="text-xs text-neutral-400">Upload & process HLS media streams.</p>
              </div>
              <Link to="/instructor/upload" className="inline-block bg-neutral-900 hover:bg-orange-600 hover:text-black text-white border border-neutral-700 hover:border-orange-500 font-semibold px-4 py-2.5 rounded-xl text-xs text-center transition-all">
                Upload Video →
              </Link>
            </div>

            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-orange-500/50 transition-all shadow-xl group">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Create Quiz</h3>
                <p className="text-xs text-neutral-400">Build interactive auto-graded quizzes.</p>
              </div>
              <Link to="/instructor/create-quiz" className="inline-block bg-neutral-900 hover:bg-orange-600 hover:text-black text-white border border-neutral-700 hover:border-orange-500 font-semibold px-4 py-2.5 rounded-xl text-xs text-center transition-all">
                Create Quiz →
              </Link>
            </div>

            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-orange-500/50 transition-all shadow-xl group">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Browse Courses</h3>
                <p className="text-xs text-neutral-400">View public published courses catalog.</p>
              </div>
              <Link to="/courses" className="inline-block bg-neutral-900 hover:bg-orange-600 hover:text-black text-white border border-neutral-700 hover:border-orange-500 font-semibold px-4 py-2.5 rounded-xl text-xs text-center transition-all">
                View Catalog →
              </Link>
            </div>

          </div>
        </section>

        {/* INSTRUCTOR EARNINGS SECTION */}
        <section className="space-y-6 pt-6 border-t border-neutral-900">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-500" /> Instructor Earnings & Payouts
            </h2>
            <p className="text-xs text-neutral-400">Track real-time course sales revenue breakdown.</p>
          </div>

          {earningsLoading && (
            <div className="flex items-center gap-2 text-orange-500 text-xs font-bold animate-pulse py-4">
              <Sparkles className="w-4 h-4" /> Loading earnings breakdown...
            </div>
          )}

          {earningsError && (
            <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold">
              {earningsError}
            </div>
          )}

          {!earningsLoading && earnings && (
            <div className="space-y-8">
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex items-center justify-between shadow-xl">
                  <div className="space-y-1">
                    <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Earnings</span>
                    <h3 className="text-3xl font-black text-white">
                      ₹{Number(earnings.totalEarnings || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex items-center justify-between shadow-xl">
                  <div className="space-y-1">
                    <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Sales</span>
                    <h3 className="text-3xl font-black text-orange-500">{earnings.totalSales || 0}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Course-wise Earnings Breakdown */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Course-wise Revenue Breakdown</h3>

                {earnings.courses?.length === 0 ? (
                  <div className="text-center py-12 bg-[#141414] border border-neutral-800 rounded-2xl">
                    <p className="text-neutral-400 text-xs">No course earnings available yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {earnings.courses?.map((course) => (
                      <article className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl" key={course.courseId}>
                        <h4 className="text-base font-bold text-white line-clamp-1">{course.title}</h4>
                        <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs text-neutral-300">
                          <p className="flex justify-between">
                            <span className="text-neutral-500">Sales Enrolled:</span>
                            <span className="font-bold text-white">{course.totalSales}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-neutral-500">Net Revenue:</span>
                            <span className="font-bold text-orange-500">
                              ₹{Number(course.totalEarnings || 0).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}