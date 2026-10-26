import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Hls from "hls.js";
import api from "../services/api";
import { ArrowLeft, CheckCircle2, Sparkles, Video, HelpCircle, FileText, Check } from "lucide-react";

function getYouTubeEmbedUrl(url) {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace(/^www\./, "");
    let videoId = "";

    if (host === "youtu.be") {
      videoId = parsedUrl.pathname.slice(1);
    } else if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (parsedUrl.pathname === "/watch") {
        videoId = parsedUrl.searchParams.get("v") || "";
      } else if (parsedUrl.pathname.startsWith("/embed/")) {
        videoId = parsedUrl.pathname.split("/")[2] || "";
      } else if (parsedUrl.pathname.startsWith("/shorts/")) {
        videoId = parsedUrl.pathname.split("/")[2] || "";
      }
    }

    if (!/^[\w-]{11}$/.test(videoId)) return "";

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return "";
  }
}

export default function LearnCourse() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [selectedUploadedVideo, setSelectedUploadedVideo] = useState(null);
  const uploadedVideoRef = useRef(null);
  const [enrollment, setEnrollment] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [videoError, setVideoError] = useState("");
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [lessonHasQuiz, setLessonHasQuiz] = useState(false);

  // Load course, lessons and enrollment
  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      setLoading(true);
      setError("");

      try {
        const [courseResponse, lessonResponse, enrollmentResponse] =
          await Promise.all([
            api.get(`/courses/${courseId}`),
            api.get(`/lessons/course/${courseId}`),
            api.get("/learning/my-courses"),
          ]);

        if (cancelled) return;

        const courseData =
          courseResponse.data.data ||
          courseResponse.data.course ||
          courseResponse.data;

        const lessonData = lessonResponse.data.data;
        const allLessons = Array.isArray(lessonData)
          ? lessonData
          : lessonData?.lessons || [];

        const enrollmentData = enrollmentResponse.data.data;
        const allEnrollments = Array.isArray(enrollmentData)
          ? enrollmentData
          : enrollmentData?.enrollments ||
            enrollmentResponse.data.enrollments ||
            [];

        const currentEnrollment = allEnrollments.find((item) => {
          const enrolledCourseId =
            typeof item.courseId === "object"
              ? item.courseId?._id
              : item.courseId;

          return String(enrolledCourseId) === String(courseId);
        });

        setCourse(courseData);
        setLessons(allLessons);
        setEnrollment(currentEnrollment || null);

        if (allLessons.length > 0) {
          setSelectedLessonId(allLessons[0]._id);
        } else {
          setSelectedLessonId("");
        }

        if (!currentEnrollment) {
          setError("Your enrollment was not found. Please check My Learning.");
        }
      } catch (err) {
        console.error("Load course error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load the course. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // Find selected lesson BEFORE using it in the quiz effect
  const selectedLesson = lessons.find(
    (lesson) => String(lesson._id) === String(selectedLessonId),
  );

  // Check whether the selected lesson has a quiz
  useEffect(() => {
    let isMounted = true;

    async function checkQuiz() {
      setLessonHasQuiz(false);

      if (!selectedLesson?._id) {
        return;
      }

      try {
        const response = await api.get(`/quizzes/lesson/${selectedLesson._id}`);

        const responseData = response.data?.data;

        const quiz = Array.isArray(responseData)
          ? responseData[0]
          : responseData?.quiz || responseData;

        if (isMounted) {
          setLessonHasQuiz(Boolean(quiz?._id || quiz?.id));
        }
      } catch (err) {
        if (isMounted) {
          setLessonHasQuiz(false);
        }
      }
    }

    checkQuiz();

    return () => {
      isMounted = false;
    };
  }, [selectedLesson?._id]);

  const completedLessons = enrollment?.completedLessons || [];

  const isLessonCompleted = selectedLesson
    ? completedLessons.some((id) => String(id) === String(selectedLesson._id))
    : false;

  // Load processed videos uploaded for the selected lesson
  useEffect(() => {
    let cancelled = false;

    async function loadUploadedVideos() {
      setUploadedVideos([]);
      setSelectedUploadedVideo(null);
      setVideoError("");

      if (!selectedLessonId) return;

      try {
        const response = await api.get("/media", {
          params: {
            courseId,
            lessonId: selectedLessonId,
            mediaType: "video",
          },
        });

        const data = response.data?.data;
        const videos = Array.isArray(data) ? data : [];

        if (cancelled) return;

        const processedVideos = videos.filter(
          (video) =>
            video.processingStatus === "completed" &&
            video.fileUrl &&
            video.lessonId === selectedLessonId,
        );

        setUploadedVideos(processedVideos);
      } catch (err) {
        console.error("Load uploaded videos error:", err);

        if (!cancelled) {
          setUploadedVideos([]);
        }
      }
    }

    loadUploadedVideos();

    return () => {
      cancelled = true;
    };
  }, [courseId, selectedLessonId]);

  // Play uploaded HLS videos using hls.js
  useEffect(() => {
    const videoElement = uploadedVideoRef.current;
    const videoUrl = selectedUploadedVideo?.fileUrl;

    setVideoError("");

    if (!videoElement || !videoUrl) return;

    let hls;

    if (Hls.isSupported()) {
      hls = new Hls();

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error("HLS playback error:", data);

        if (data.fatal) {
          setVideoError(
            `HLS error: ${data.details}. Check browser console for details.`,
          );
        }
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(videoElement);
    } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
      videoElement.src = videoUrl;
    } else {
      setVideoError("Your browser does not support HLS playback.");
    }

    return () => {
      if (hls) hls.destroy();

      videoElement.removeAttribute("src");
      videoElement.load();
    };
  }, [selectedUploadedVideo?.fileUrl]);

  async function handleCompleteLesson() {
    if (!enrollment?._id || !selectedLesson?._id) {
      setError("Enrollment or lesson information is missing.");
      return;
    }

    setCompleting(true);
    setError("");
    setMessage("");

    try {
      const response = await api.patch(
        `/learning/${enrollment._id}/complete-lesson`,
        { lessonId: selectedLesson._id },
      );

      const updatedEnrollment = response.data.data || response.data.enrollment;

      if (updatedEnrollment) {
        setEnrollment(updatedEnrollment);
      } else {
        setEnrollment((previous) => ({
          ...previous,
          completedLessons: [
            ...new Set([
              ...(previous?.completedLessons || []),
              selectedLesson._id,
            ]),
          ],
        }));
      }

      setMessage(response.data.message || "Lesson marked as completed.");
    } catch (err) {
      console.error("Complete lesson error:", err);

      setError(
        err.response?.data?.message ||
          "Could not mark this lesson as completed.",
      );
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-[#0B0B0B] text-white min-h-screen flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-orange-500 font-bold text-lg animate-pulse">
          <Sparkles className="w-6 h-6" /> Loading course classroom...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-[#0B0B0B] text-white min-h-screen flex flex-col items-center justify-center font-sans space-y-4 px-6">
        <p role="alert" className="text-red-400 text-sm font-semibold">{error || "Course not found."}</p>
        <Link to="/my-courses" className="text-xs text-neutral-400 hover:text-orange-500 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to My Learning
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans flex flex-col">
      
      {/* Top Classroom Bar */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <Link 
          to="/my-courses" 
          className="text-xs font-semibold text-neutral-400 hover:text-orange-500 flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Learning
        </Link>

        <h1 className="text-sm font-bold text-white truncate max-w-md hidden sm:block">
          {course.title || "Course Learning"}
        </h1>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-neutral-400">Progress:</span>
          <span className="font-bold text-orange-500">{enrollment?.progress ?? 0}%</span>
        </div>
      </header>

      {/* Main Classroom Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 min-h-[calc(100vh-73px)]">
        
        {/* Left/Main Content Area: Video Player & Lesson Details */}
        <div className="lg:col-span-3 p-6 lg:p-10 space-y-8 overflow-y-auto border-r border-neutral-900">
          
          {/* Status Messages */}
          {error && (
            <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}
          {message && (
            <div role="status" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-semibold">
              {message}
            </div>
          )}

          {selectedLesson ? (
            <div className="space-y-6">
              
              {/* Video Player Container */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
                
                {/* Uploaded HLS Video Player */}
                {selectedUploadedVideo ? (
                  <div className="space-y-2">
                    <video
                      ref={uploadedVideoRef}
                      controls
                      playsInline
                      className="w-full aspect-video bg-black object-contain"
                    />

                    {videoError && (
                      <p role="alert" className="text-red-400 text-xs p-4 bg-red-500/10">
                        {videoError}
                      </p>
                    )}
                  </div>
                ) : getYouTubeEmbedUrl(selectedLesson.videoUrl) ? (
                  <iframe
                    title={selectedLesson.title}
                    src={getYouTubeEmbedUrl(selectedLesson.videoUrl)}
                    className="w-full aspect-video border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full aspect-video bg-neutral-900 flex flex-col items-center justify-center text-neutral-400 space-y-3">
                    <Video className="w-10 h-10 text-orange-500 animate-pulse" />
                    <p className="text-xs">No direct video embed available.</p>
                    {selectedLesson.videoUrl && (
                      <a
                        href={selectedLesson.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-orange-500 underline font-semibold"
                      >
                        Open video externally →
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Uploaded Videos Library Selector */}
              {uploadedVideos.length > 0 && (
                <div className="bg-[#141414] border border-neutral-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" /> Available Cloud Stream Variants
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {uploadedVideos.map((video) => (
                      <button
                        key={video._id}
                        type="button"
                        onClick={() => setSelectedUploadedVideo(video)}
                        className={`p-3.5 text-left rounded-xl border text-xs transition-all ${
                          selectedUploadedVideo?._id === video._id
                            ? "bg-orange-600/10 border-orange-500 text-white font-semibold"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                        }`}
                      >
                        <div className="font-bold truncate text-white">{video.title}</div>
                        <div className="text-[10px] text-neutral-500 mt-1 uppercase">
                          {selectedUploadedVideo?._id === video._id ? "Streaming Now" : "Click to Play"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson Info & Action Buttons */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <span className="text-orange-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Active Lesson</span>
                  <h2 className="text-2xl font-black text-white">{selectedLesson.title}</h2>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    {selectedLesson.description || "Detailed lesson overview and technical breakdown."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={handleCompleteLesson}
                    disabled={
                      completing ||
                      isLessonCompleted ||
                      enrollment?.status === "completed"
                    }
                    className={`font-bold px-6 py-3.5 rounded-xl text-xs transition-all flex items-center gap-2 ${
                      isLessonCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-600/20"
                    }`}
                  >
                    {completing ? (
                      "Saving Progress..."
                    ) : isLessonCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Lesson Completed
                      </>
                    ) : (
                      "Mark as Complete"
                    )}
                  </button>

                  {lessonHasQuiz && (
                    <Link
                      to={`/quiz/${selectedLesson._id}`}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 font-semibold px-6 py-3.5 rounded-xl text-xs transition-all flex items-center gap-2"
                    >
                      <HelpCircle className="w-4 h-4 text-orange-500" /> Take Lesson Quiz →
                    </Link>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-24 bg-[#141414] border border-neutral-800 rounded-2xl">
              <p className="text-neutral-400 text-sm">Select a lesson from the curriculum to start learning.</p>
            </div>
          )}

        </div>

        {/* Right Sidebar: Lesson Curriculum Index */}
        <div className="lg:col-span-1 bg-neutral-950 p-6 space-y-6">
          <div className="border-b border-neutral-900 pb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" /> Course Curriculum
            </h3>
            <p className="text-[11px] text-neutral-500 mt-1">{lessons.length} lessons available</p>
          </div>

          {lessons.length === 0 ? (
            <p className="text-xs text-neutral-500">No published lessons available yet.</p>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, index) => {
                const completed = completedLessons.some(
                  (id) => String(id) === String(lesson._id),
                );
                const isSelected = selectedLessonId === lesson._id;

                return (
                  <button
                    key={lesson._id}
                    type="button"
                    onClick={() => {
                      setSelectedLessonId(lesson._id);
                      setSelectedUploadedVideo(null);
                      setVideoError("");
                      setError("");
                      setMessage("");
                    }}
                    aria-pressed={isSelected}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-orange-600/10 border-orange-500 text-white font-bold"
                        : "bg-[#141414] border-neutral-800/80 text-neutral-300 hover:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        completed ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-neutral-400"
                      }`}>
                        {completed ? <Check className="w-3 h-3" /> : index + 1}
                      </span>
                      <span className="truncate">{lesson.title}</span>
                    </div>

                    {completed && (
                      <span className="text-[10px] text-emerald-400 font-semibold shrink-0">Done</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}