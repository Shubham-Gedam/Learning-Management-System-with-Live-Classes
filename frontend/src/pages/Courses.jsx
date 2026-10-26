import { useEffect, useState } from "react";
import axios from "axios";
import CourseCard from "../components/CourseCard";
import { Sparkles } from "lucide-react";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3002/api/courses")
      .then((response) => {
        console.log("Course API response:", response.data);
        setCourses(response.data.courses || []);
      })
      .catch((err) => {
        console.error("Course fetch error:", err);
        setError(err.message || "Failed to fetch courses");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-[#0B0B0B] text-white min-h-screen flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-orange-500 font-bold text-lg animate-pulse">
          <Sparkles className="w-6 h-6" /> Loading courses...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0B0B0B] text-white min-h-screen flex items-center justify-center font-sans">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl text-sm font-semibold">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans px-6 lg:px-16 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center md:text-left space-y-2 border-b border-neutral-900 pb-6">
          <span className="text-orange-500 text-xs font-bold tracking-[0.2em] uppercase">
            EXPLORE COURSES
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Level Up Your Skills With Expert-Led Programs
          </h1>
          <p className="text-sm text-neutral-400">
            {courses.length} courses available to master production-grade technology.
          </p>
        </div>

        {/* Course Grid Layout */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-neutral-950 border border-neutral-900 rounded-2xl">
            <p className="text-neutral-400 text-sm">No courses found.</p>
          </div>
        )}

      </div>
    </div>
  );
}