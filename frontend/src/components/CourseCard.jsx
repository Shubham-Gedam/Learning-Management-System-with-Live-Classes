import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CourseCard({ course }) {
  if (!course) return null;

  return (
    <article className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between hover:border-orange-500/50 transition-all duration-300 group shadow-xl">
      
      {/* Top Section: Thumbnail & Category Badge */}
      <div className="space-y-4">
        {/* Course Thumbnail / Banner Mock (Agar course.thumbnail hai toh wo dikhega, warna gradient banner) */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-orange-950/40 flex items-center justify-center text-orange-500 font-bold text-lg">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          )}

          {/* Live / Level Badge */}
          <span className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md border border-neutral-700 text-neutral-300 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">
            {course.level || "All Levels"}
          </span>
        </div>

        {/* Category Tag */}
        <div className="flex flex-wrap gap-2">
          <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase">
            {course.category || "General"}
          </span>
        </div>

        {/* Course Title */}
        <h2 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
          <Link to={`/courses/${course._id}`}>
            {course.title || "Untitled Course"}
          </Link>
        </h2>

        {/* Course Description */}
        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
          {course.description || "Explore this course to master modern development skills and build real-world projects."}
        </p>
      </div>

      {/* Bottom Section: Price & Check Course CTA */}
      <div className="pt-6 mt-6 border-t border-neutral-800/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-medium">Price</span>
          <strong className="text-base sm:text-lg font-black text-white">
            {Number(course.price) === 0
              ? "Free"
              : `₹${Number(course.price).toLocaleString("en-IN")}`}
          </strong>
        </div>

        <Link 
          to={`/courses/${course._id}`}
          className="bg-neutral-900 hover:bg-orange-600 hover:text-black text-white border border-neutral-700 hover:border-orange-500 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all duration-200 flex items-center gap-1.5 group/btn"
        >
          Check Course <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>

    </article>
  );
}