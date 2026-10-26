import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Sparkles, CheckCircle2, ShieldCheck, PlayCircle } from "lucide-react";

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:3002/api/courses/${courseId}`)
      .then((response) => {
        const data = response.data;
        setCourse(data.course || data.data?.course || data.data || data);
      })
      .catch((err) => {
        console.error(err);
        setError("Course details load nahi hui.");
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="bg-[#0B0B0B] text-white min-h-screen flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-orange-500 font-bold text-lg animate-pulse">
          <Sparkles className="w-6 h-6" /> Loading course details...
        </div>
      </div>
    );
  }

  if (error || !course?._id) {
    return (
      <div className="bg-[#0B0B0B] text-white min-h-screen flex flex-col items-center justify-center font-sans space-y-4 px-6">
        <h2 className="text-xl font-bold text-red-400">{error || "Course not found"}</h2>
        <Link 
          to="/courses" 
          className="text-sm text-neutral-400 hover:text-orange-500 flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans px-6 lg:px-16 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link 
          to="/courses" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-orange-500 transition-colors uppercase tracking-wider bg-neutral-900/60 border border-neutral-800 px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>

        {/* Main Details Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Course Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                {course.category || "General"}
              </span>
              <span className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                {course.level || "All Levels"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              {course.description}
            </p>

            {/* Highlights Box */}
            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">What you'll master</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" /> Production-grade MERN Stack
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" /> Real-time Live Classes via WebRTC
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" /> Auto-graded Quizzes & Progress
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" /> Verified PDF Certificates
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Pricing & Sticky Checkout Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-[#141414] border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-2xl">
              
              {/* Thumbnail / Video Banner Preview */}
              <div className="relative aspect-video rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <PlayCircle className="w-12 h-12 text-orange-500 animate-pulse" />
                )}
              </div>

              {/* Price Details */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <span className="text-xs text-neutral-400 uppercase tracking-widest font-medium">Total Investment</span>
                <span className="text-2xl font-black text-white">
                  {course.price === 0 ? "Free" : `₹${course.price.toLocaleString("en-IN")}`}
                </span>
              </div>

              {/* Action Button (Exact same handler as your original code) */}
              <button
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-4 rounded-xl text-sm transition-all duration-300 shadow-xl shadow-orange-600/20 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                disabled={enrolling}
                onClick={async () => {
                  const user = JSON.parse(localStorage.getItem("user") || "null");

                  if (!user) {
                    navigate("/login");
                    return;
                  }

                  if (course.price > 0) {
                    navigate(`/checkout/${course._id}`);
                    return;
                  }

                  setEnrolling(true);
                  setEnrollError("");

                  try {
                    await axios.post(
                      "http://localhost:3003/api/learning/enroll",
                      { courseId: course._id },
                      { withCredentials: true },
                    );

                    alert("Course enrolled successfully!");
                    navigate("/my-courses");
                  } catch (err) {
                    setEnrollError(
                      err.response?.data?.message ||
                        "Enrollment failed. Please try again.",
                    );
                  } finally {
                    setEnrolling(false);
                  }
                }}
              >
                {enrolling
                  ? "Enrolling..."
                  : course.price === 0
                  ? "Enroll Now →"
                  : "Buy Now →"}
              </button>

              {enrollError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center font-medium">
                  {enrollError}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 pt-2">
                <ShieldCheck className="w-4 h-4 text-orange-500" /> Secure checkout & instant access
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}