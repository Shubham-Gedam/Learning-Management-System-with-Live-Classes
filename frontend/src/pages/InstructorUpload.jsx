import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Upload, FileVideo, Sparkles, CheckCircle2, AlertCircle, Lock } from "lucide-react";

function InstructorUpload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [video, setVideo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mediaId, setMediaId] = useState("");
  const [messageType, setMessageType] = useState("");
  const fileInputRef = useRef(null);

  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonOrder, setLessonOrder] = useState("1");
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [lessonMessage, setLessonMessage] = useState("");
  const [lessonMessageType, setLessonMessageType] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoadingCourses(true);
        const response = await api.get("/courses/my");
        const myCourses = response.data.courses || response.data.data || [];

        setCourses(Array.isArray(myCourses) ? myCourses : []);
      } catch (error) {
        console.error("Course fetch error:", error.response?.data || error);
        setMessage(
          error.response?.data?.message ||
            "Unable to load your courses. Please refresh and try again.",
        );
        setMessageType("error");
      } finally {
        setLoadingCourses(false);
      }
    }

    fetchCourses();
  }, []);

  function handleVideoSelect(file) {
    if (!file) return;

    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select an MP4, WebM or MOV video.");
      setMessageType("error");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setMessage("Video size must not exceed 100 MB.");
      setMessageType("error");
      return;
    }

    setVideo(file);
    setMessage("");
    setMessageType("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!courseId) {
      setMessage("Please select a course.");
      setMessageType("error");
      return;
    }

    if (!video) {
      setMessage("Please select a video file.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setMessageType("");
      setMediaId("");
      setUploadedMedia(null);
      setLessonMessage("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("courseId", courseId);
      formData.append("video", video);

      const response = await api.post("/media/upload", formData);
      const media = response.data?.data?.media;

      if (!media?._id || !media?.fileUrl) {
        throw new Error(
          "Upload response did not include the media ID and video URL.",
        );
      }

      setMediaId(media._id);
      setUploadedMedia({
        ...media,
        courseId: media.courseId || courseId,
      });
      setLessonTitle(media.title || title);
      setLessonDescription(media.description || description);
      setLessonOrder("1");

      setMessage(
        response.data.message || "Video uploaded. Create a lesson below.",
      );
      setMessageType("success");

      setTitle("");
      setDescription("");
      setVideo(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error.response?.data || error);
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Video upload failed. Please try again.",
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLesson(e) {
    e.preventDefault();

    if (!uploadedMedia) {
      setLessonMessage("Upload a video first.");
      setLessonMessageType("error");
      return;
    }

    const order = Number(lessonOrder);

    if (!Number.isInteger(order) || order < 1) {
      setLessonMessage("Lesson order must be a positive integer.");
      setLessonMessageType("error");
      return;
    }

    if (!lessonTitle.trim()) {
      setLessonMessage("Please enter a lesson title.");
      setLessonMessageType("error");
      return;
    }

    try {
      setCreatingLesson(true);
      setLessonMessage("");
      setLessonMessageType("");

      const lessonResponse = await api.post("/lessons", {
        courseId: uploadedMedia.courseId || courseId,
        title: lessonTitle.trim(),
        description: lessonDescription.trim(),
        videoUrl: uploadedMedia.fileUrl,
        durationSeconds: 0,
        order,
      });

      const lesson = lessonResponse.data?.data;

      if (!lesson?._id) {
        throw new Error(
          "Lesson was created, but its ID was not returned. Check your lessons before retrying.",
        );
      }

      try {
        await api.patch(`/lessons/${lesson._id}/publish`, {
          isPublished: true,
        });
        await api.patch(`/media/${uploadedMedia._id}/lesson`, {
          lessonId: lesson._id,
        });

        setLessonMessage(
          `Lesson "${lesson.title}" created and published successfully.`,
        );
        setLessonMessageType("success");
        setUploadedMedia(null);
        setMediaId("");
      } catch (publishError) {
        console.error(
          "Lesson publish error:",
          publishError.response?.data || publishError,
        );

        setLessonMessage(
          `Lesson created but not published. Lesson ID: ${lesson._id}. ` +
            (publishError.response?.data?.message ||
              "Please publish it separately."),
        );
        setLessonMessageType("error");
      }
    } catch (error) {
      console.error("Create lesson error:", error.response?.data || error);

      setLessonMessage(
        error.response?.data?.message ||
          error.message ||
          "Could not create the lesson.",
      );
      setLessonMessageType("error");
    } finally {
      setCreatingLesson(false);
    }
  }

  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans px-6 lg:px-16 py-12">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Topbar & Back Link */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-6">
          <Link 
            to="/instructor/dashboard" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-orange-500 transition-colors uppercase tracking-wider bg-neutral-900/60 border border-neutral-800 px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <span className="text-orange-500 text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> INSTRUCTOR STUDIO
          </span>
        </div>

        {/* Heading Section */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <Upload className="w-8 h-8 text-orange-500" /> Upload course video
          </h1>
          <p className="text-sm text-neutral-400">
            Upload your video stream, then attach and publish the lesson for students.
          </p>
        </div>

        {/* Step 1 & 2: Video Upload Form */}
        <form className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl" onSubmit={handleSubmit}>
          
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Video details</h2>
              <p className="text-xs text-neutral-400">Choose the course and enter video information.</p>
            </div>
            <span className="text-xs text-orange-500 font-mono font-bold bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-md">STEP 01</span>
          </div>

          {/* Select Course */}
          <div className="space-y-1.5">
            <label htmlFor="course-select" className="text-xs font-semibold text-neutral-300">
              Select course <span className="text-orange-500">*</span>
            </label>
            <select
              id="course-select"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              disabled={loadingCourses || courses.length === 0 || loading}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition disabled:opacity-50"
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
                  {course.title} ({course.status || "unknown"})
                </option>
              ))}
            </select>
            {!loadingCourses && courses.length === 0 && (
              <p className="text-[11px] text-amber-500 pt-1">
                No courses found. Create a course first or check your instructor account.
              </p>
            )}
          </div>

          {/* Video Title */}
          <div className="space-y-1.5">
            <label htmlFor="video-title" className="text-xs font-semibold text-neutral-300">
              Video title <span className="text-orange-500">*</span>
            </label>
            <input
              id="video-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Node.js Backend Introduction"
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Video Description */}
          <div className="space-y-1.5">
            <label htmlFor="video-description" className="text-xs font-semibold text-neutral-300">Description</label>
            <textarea
              id="video-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What will students learn in this video?"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition resize-none"
            />
          </div>

          <div className="border-t border-neutral-800/80 pt-6">
            <div className="flex items-center justify-between pb-4">
              <div>
                <h2 className="text-base font-bold text-white">Video file</h2>
                <p className="text-xs text-neutral-400">Select the video you want to upload.</p>
              </div>
              <span className="text-xs text-orange-500 font-mono font-bold bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-md">STEP 02</span>
            </div>

            {/* Dropzone Box */}
            <button
              type="button"
              className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                video 
                  ? "bg-orange-500/10 border-orange-500 text-white" 
                  : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-400"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleVideoSelect(e.dataTransfer.files?.[0]);
              }}
            >
              <FileVideo className="w-10 h-10 text-orange-500 mb-3 animate-pulse" />
              <strong className="text-sm font-bold text-white mb-1">
                {video ? video.name : "Click to choose a video"}
              </strong>
              <span className="text-xs text-neutral-400 mb-2">
                {video
                  ? `${(video.size / (1024 * 1024)).toFixed(1)} MB · Selected`
                  : "or drag and drop your file here"}
              </span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest">
                MP4, WebM or MOV · Maximum 100 MB
              </span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              name="video"
              accept="video/mp4,video/webm,video/quicktime"
              hidden
              onChange={(e) => handleVideoSelect(e.target.files?.[0])}
            />
          </div>

          {/* Upload Submit Action */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading || loadingCourses || courses.length === 0}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-4 rounded-xl text-sm transition-all duration-300 shadow-xl shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Uploading your video..." : "Upload video →"}
            </button>
            <p className="text-[11px] text-neutral-500 text-center">Your video will be processed securely in the background.</p>
          </div>

          {/* Status Message */}
          {message && (
            <div
              role="status"
              className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                messageType === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              {messageType === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message}
            </div>
          )}

          {mediaId && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Media ID:</span>
              <code className="text-orange-400 font-mono">{mediaId}</code>
            </div>
          )}
        </form>

        {/* Step 3: Create Lesson Form (Appears when video is uploaded) */}
        {uploadedMedia && (
          <form className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl" onSubmit={handleCreateLesson}>
            
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">Create lesson</h2>
                <p className="text-xs text-neutral-400">Video uploaded. Now attach it to a lesson and publish it.</p>
              </div>
              <span className="text-xs text-orange-500 font-mono font-bold bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-md">STEP 03</span>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lesson-title" className="text-xs font-semibold text-neutral-300">
                Lesson title <span className="text-orange-500">*</span>
              </label>
              <input
                id="lesson-title"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lesson-description" className="text-xs font-semibold text-neutral-300">Lesson description</label>
              <textarea
                id="lesson-description"
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-orange-500 transition resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lesson-order" className="text-xs font-semibold text-neutral-300">
                Lesson order <span className="text-orange-500">*</span>
              </label>
              <input
                id="lesson-order"
                type="number"
                min="1"
                step="1"
                value={lessonOrder}
                onChange={(e) => setLessonOrder(e.target.value)}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition"
              />
              <small className="text-[11px] text-neutral-500 block">
                Use a unique order number within this course, e.g. 1 for the first lesson or 2 for the second.
              </small>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center justify-between text-xs overflow-hidden">
              <span className="text-neutral-400 shrink-0">Video URL:</span>
              <code className="text-orange-400 font-mono truncate max-w-[260px] sm:max-w-md">{uploadedMedia.fileUrl}</code>
            </div>

            <button
              type="submit"
              disabled={creatingLesson}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl text-sm transition-all duration-300 shadow-xl shadow-emerald-600/20 disabled:opacity-50"
            >
              {creatingLesson ? "Creating lesson..." : "Create and publish lesson →"}
            </button>

            {lessonMessage && (
              <div
                role="status"
                className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  lessonMessageType === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}
              >
                {lessonMessageType === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {lessonMessage}
              </div>
            )}
          </form>
        )}

        <div className="text-center pt-4">
          <p className="text-xs text-neutral-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-orange-500" /> Your content is processed securely on AWS cloud infrastructure.
          </p>
        </div>

      </div>
    </div>
  );
}

export default InstructorUpload;