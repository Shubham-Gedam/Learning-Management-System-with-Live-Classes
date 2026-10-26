import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

function Home() {
  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen selection:bg-orange-500 selection:text-black font-sans">
      
      {/* HERO SECTION */}
      <main className="relative overflow-hidden pt-24 pb-32 px-6 lg:px-12 flex flex-col items-center text-center">
        
        {/* Background Radial Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 blur-[150px] pointer-events-none rounded-full"></div>

        {/* Eyebrow Text */}
        <span className="text-orange-500 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-6">
          LEARN. BUILD. GET PLACED.
        </span>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl leading-[1.15] mb-6">
          Become The Software Engineer <br className="hidden sm:block" />
          That <span className="text-white relative inline-block underline decoration-orange-500/60 decoration-wavy underline-offset-8">Companies</span> Want To Hire!
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mb-10 leading-relaxed">
          Join a growing community of students preparing for real-world tech careers with structured MERN stack courses, live classes, and hands-on projects.
        </p>

        {/* Student Avatars / Social Proof snippet */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-10 bg-neutral-900/60 border border-neutral-800 px-5 py-2.5 rounded-full">
          <div className="flex -space-x-2 overflow-hidden">
            <div className="inline-block h-7 w-7 rounded-full ring-2 ring-neutral-900 bg-orange-500 text-black font-bold text-[10px] flex items-center justify-center">JD</div>
            <div className="inline-block h-7 w-7 rounded-full ring-2 ring-neutral-900 bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center">AS</div>
            <div className="inline-block h-7 w-7 rounded-full ring-2 ring-neutral-900 bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center">MK</div>
            <div className="inline-block h-7 w-7 rounded-full ring-2 ring-neutral-900 bg-emerald-500 text-black font-bold text-[10px] flex items-center justify-center">RK</div>
          </div>
          <span className="text-xs text-neutral-300 font-medium">
            <strong className="text-white font-bold">1 Million+</strong> Students learning in our mastery programs
          </span>
        </div>

        {/* Call To Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            to="/courses" 
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-8 py-4 rounded-full text-base transition-all duration-300 shadow-xl shadow-orange-600/20 hover:scale-105 flex items-center gap-3"
          >
            Start Journey <ArrowRight className="w-5 h-5" />
          </Link>

          <Link 
            to="/classes" 
            className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 font-semibold px-8 py-4 rounded-full text-base transition-all duration-300 hover:border-neutral-700 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-orange-500" /> Explore Live Classes
          </Link>
        </div>

      </main>

    </div>
  );
}

export default Home;