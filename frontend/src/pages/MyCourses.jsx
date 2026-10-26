import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { issueCertificate } from "../services/certificate.service";
import { BookOpen, Award, PlayCircle, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [issuingCertificate, setIssuingCertificate] = useState("");

  useEffect(() => {
    async function fetchMyCourses() {
      try {
        const response = await api.get("/learning/my-courses", { withCredentials: true });

        const enrollments = response.data.data || [];

        const results = await Promise.all(
          enrollments.map(async (enrollment) => {
            try {
              const courseResponse = await api.get(`/courses/${enrollment.courseId}`, {
                withCredentials: true,
              });

              return {
                ...enrollment,
                course: courseResponse.data.course,
              };
            } catch (err) {
              console.error("Course details error:", err);
              return { ...enrollment, course: null };
            }
          }),
        );

        setCourses(results);
      } catch (err) {
        console.error("My courses error:", err);
        setError(err.response?.data?.message || "Failed to load your courses.");
      } finally {
        setLoading(false);
      }
    }

    fetchMyCourses();
  }, []);

  async function handleGetCertificate(enrollment) {
    try {
      setError("");
      setIssuingCertificate(enrollment._id);

      const response = await issueCertificate(enrollment.courseId, {
        studentName: JSON.parse(localStorage.getItem("user") || "{}").name,
        courseName: enrollment.course?.title,
      });

      const certificate = response.data?.data;

      if (!certificate?.certificateId) {
        throw new Error("Certificate ID was not returned by the server.");
      }

      navigate(`/certificate/${certificate.certificateId}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to issue certificate.",
      );
    } finally {
      setIssuingCertificate("");
    }
  }

  if (loading) {
    return (
      <div className="bg-[#0B0B0B] text-white min-h-screen flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-orange-500 font-bold text-lg animate-pulse">
          <Sparkles className="w-6 h-6" /> Loading your courses...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0B0B0B] text-white min-h-screen flex flex-col items-center justify-center font-sans px-6 space-y-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans px-6 lg:px-16 py-12">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="text-center md:text-left space-y-2 border-b border-neutral-900 pb-6">
          <span className="text-orange-500 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center md:justify-start gap-2">
            <BookOpen className="w-4 h-4" /> STUDENT DASHBOARD
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            My Learning
          </h1>
          <p className="text-sm text-neutral-400">
            Your enrolled mastery programs, active progress tracking, and certified credentials.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20 bg-[#141414] border border-neutral-800 rounded-2xl space-y-4 max-w-lg mx-auto">
            <p className="text-neutral-400 text-sm">You haven't enrolled in any courses yet.</p>
            <Link 
              to="/courses" 
              className="inline-block bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-orange-600/20"
            >
              Explore Courses →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((enrollment) => (
              <article 
                key={enrollment._id} 
                className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-orange-500/40 transition-all shadow-xl"
              >
                
                {/* Course Metadata & Title */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                      {enrollment.course?.category || "Course"}
                    </span>
                    <span className="text-xs text-neutral-400 font-semibold uppercase">
                      {enrollment.status || "Enrolled"}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white line-clamp-2">
                    {enrollment.course?.title || "Course details unavailable"}
                  </h2>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {enrollment.course?.description || ""}
                  </p>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-medium">Progress</span>
                    <span className="text-white font-bold">{enrollment.progress ?? 0}%</span>
                  </div>
                  
                  <div className="w-full bg-neutral-900 border border-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-600 to-amber-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${enrollment.progress ?? 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2 border-t border-neutral-800/80">
                  <Link
                    to={`/learn/${enrollment.courseId}`}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 hover:border-orange-500 font-semibold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <PlayCircle className="w-4 h-4 text-orange-500" /> Continue Learning
                  </Link>

                  {enrollment.status === "completed" &&
                    Number(enrollment.progress) >= 100 && (
                      <button
                        type="button"
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        onClick={() => handleGetCertificate(enrollment)}
                        disabled={issuingCertificate === enrollment._id}
                      >
                        <Award className="w-4 h-4" />
                        {issuingCertificate === enrollment._id
                          ? "Generating Certificate..."
                          : "Get Certificate"}
                      </button>
                    )}
                </div>

              </article>
            ))}
          </div>
        )}

        {/* Footer Explore Link */}
        <div className="pt-6 border-t border-neutral-900 text-center">
          <Link to="/courses" className="text-xs font-semibold text-neutral-400 hover:text-orange-500 transition-colors uppercase tracking-wider">
            Explore more courses →
          </Link>
        </div>

      </div>
    </div>
  );
}