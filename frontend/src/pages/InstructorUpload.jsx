import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

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
    <main className="upload-page">
      <div className="upload-topbar">
        <Link to="/instructor/dashboard" className="upload-back">
          ← Dashboard
        </Link>
        <span className="upload-badge">INSTRUCTOR STUDIO</span>
      </div>

      <header className="upload-heading">
        <div className="upload-heading-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V4m0 0L7 9m5-5 5 5M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1>Upload course video</h1>
        <p>
          Upload your video, then create and publish the lesson for students.
        </p>
      </header>

      <form className="upload-card" onSubmit={handleSubmit}>
        <div className="upload-card-heading">
          <div>
            <h2>Video details</h2>
            <p>Choose the course and enter the video information.</p>
          </div>
          <span className="upload-step">STEP 01</span>
        </div>

        <div className="upload-field">
          <label htmlFor="course-select">
            Select course <span>*</span>
          </label>
          <select
            id="course-select"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            disabled={loadingCourses || courses.length === 0 || loading}
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
            <small>
              No courses found. Create a course first or check your instructor
              account.
            </small>
          )}
        </div>

        <div className="upload-field">
          <label htmlFor="video-title">
            Video title <span>*</span>
          </label>
          <input
            id="video-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Node.js Backend Introduction"
            required
          />
        </div>

        <div className="upload-field">
          <label htmlFor="video-description">Description</label>
          <textarea
            id="video-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="What will students learn in this video?"
          />
        </div>

        <div className="upload-divider" />

        <div className="upload-card-heading file-heading">
          <div>
            <h2>Video file</h2>
            <p>Select the video you want to upload.</p>
          </div>
          <span className="upload-step">STEP 02</span>
        </div>

        <button
          type="button"
          className={`upload-dropzone ${video ? "has-file" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleVideoSelect(e.dataTransfer.files?.[0]);
          }}
        >
          <span className="upload-file-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 16V4m0 0L7 9m5-5 5 5M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <strong>{video ? video.name : "Click to choose a video"}</strong>
          <span>
            {video
              ? `${(video.size / (1024 * 1024)).toFixed(1)} MB · Selected`
              : "or drag and drop your file here"}
          </span>
          <small>MP4, WebM or MOV · Maximum 100 MB</small>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          name="video"
          accept="video/mp4,video/webm,video/quicktime"
          hidden
          onChange={(e) => handleVideoSelect(e.target.files?.[0])}
        />

        <div className="upload-actions">
          <button
            type="submit"
            disabled={loading || loadingCourses || courses.length === 0}
            className="upload-submit"
          >
            {loading ? "Uploading your video..." : "Upload video"}
            {!loading && <span aria-hidden="true"> →</span>}
          </button>
          <p>Your video will be processed in the background.</p>
        </div>

        {message && (
          <div role="status" className={`upload-message ${messageType}`}>
            <strong>{messageType === "success" ? "✓ " : "! "}</strong>
            {message}
          </div>
        )}

        {mediaId && (
          <div className="upload-media-id">
            <span>Media ID</span>
            <code>{mediaId}</code>
          </div>
        )}
      </form>

      {uploadedMedia && (
        <form className="upload-card" onSubmit={handleCreateLesson}>
          <div className="upload-card-heading">
            <div>
              <h2>Create lesson</h2>
              <p>Video uploaded. Now attach it to a lesson and publish it.</p>
            </div>
            <span className="upload-step">STEP 03</span>
          </div>

          <div className="upload-field">
            <label htmlFor="lesson-title">
              Lesson title <span>*</span>
            </label>
            <input
              id="lesson-title"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              required
            />
          </div>

          <div className="upload-field">
            <label htmlFor="lesson-description">Lesson description</label>
            <textarea
              id="lesson-description"
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="upload-field">
            <label htmlFor="lesson-order">
              Lesson order <span>*</span>
            </label>
            <input
              id="lesson-order"
              type="number"
              min="1"
              step="1"
              value={lessonOrder}
              onChange={(e) => setLessonOrder(e.target.value)}
              required
            />
            <small>
              Use a unique order number within this course, for example 1 for
              the first lesson or 2 for the second.
            </small>
          </div>

          <div className="upload-media-id">
            <span>Video URL</span>
            <code>{uploadedMedia.fileUrl}</code>
          </div>

          <div className="upload-actions">
            <button
              type="submit"
              disabled={creatingLesson}
              className="upload-submit"
            >
              {creatingLesson
                ? "Creating lesson..."
                : "Create and publish lesson"}
            </button>
          </div>

          {lessonMessage && (
            <div
              role="status"
              className={`upload-message ${lessonMessageType}`}
            >
              <strong>{lessonMessageType === "success" ? "✓ " : "! "}</strong>
              {lessonMessage}
            </div>
          )}
        </form>
      )}

      <p className="upload-footer">🔒 Your content is processed securely.</p>
    </main>
  );
}

export default InstructorUpload;
