import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Hls from "hls.js";
import api from "../services/api";

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
        console.log(
          "Lessons fetched for course:",
          JSON.stringify(
            allLessons.map((lesson) => ({
              id: lesson._id,
              title: lesson.title,
              courseId: lesson.courseId,
            })),
            null,
            2,
          ),
        );

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
        // A missing quiz should hide the quiz button.
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

  // Load processed videos uploaded for this course
  // Load processed videos for the selected lesson
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
        console.error("HLS playback error:", {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
          url: data.url,
          response: data.response,
          reason: data.reason,
        });

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
      <main className="page">
        <h2>Loading course...</h2>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="page">
        <p role="alert">{error || "Course not found."}</p>
        <Link to="/my-courses">← Back to My Learning</Link>
      </main>
    );
  }

  return (
    <main className="page">
      <Link to="/my-courses">← Back to My Learning</Link>

      <h1>{course.title || "Course Learning"}</h1>
      <p>{course.description}</p>

      {enrollment && (
        <section className="course-card">
          <h3>Your Progress</h3>
          <p>{enrollment.progress ?? 0}% completed</p>

          <progress
            value={enrollment.progress ?? 0}
            max="100"
            style={{ width: "100%" }}
          />

          {enrollment.status === "completed" && (
            <p>Congratulations! You completed this course.</p>
          )}
        </section>
      )}

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <h2>Course Lessons</h2>

      {lessons.length === 0 ? (
        <p>No published lessons are available yet.</p>
      ) : (
        <div className="course-grid">
          <section className="course-card">
            <h3>Lesson List</h3>

            {lessons.map((lesson, index) => {
              const completed = completedLessons.some(
                (id) => String(id) === String(lesson._id),
              );

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
                  aria-pressed={selectedLessonId === lesson._id}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "12px",
                    marginBottom: "8px",
                    cursor: "pointer",
                  }}
                >
                  {index + 1}. {lesson.title}
                  {completed ? " ✓ Completed" : ""}
                </button>
              );
            })}
          </section>

          <section className="course-card">
            {selectedLesson ? (
              <>
                <h2>{selectedLesson.title}</h2>

                <p>{selectedLesson.description || "Course lesson"}</p>

                {/* Uploaded course videos */}
                {uploadedVideos.length > 0 && (
                  <section
                    style={{
                      margin: "24px 0",
                      padding: "20px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      background: "#f9fafb",
                    }}
                  >
                    <h3 style={{ marginTop: 0, marginBottom: "16px" }}>
                      Course Video Library
                    </h3>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      {uploadedVideos.map((video) => (
                        <button
                          key={video._id}
                          type="button"
                          onClick={() => setSelectedUploadedVideo(video)}
                          style={{
                            padding: "14px",
                            textAlign: "left",
                            cursor: "pointer",
                            border:
                              selectedUploadedVideo?._id === video._id
                                ? "2px solid #2563eb"
                                : "1px solid #d1d5db",
                            borderRadius: "8px",
                            background:
                              selectedUploadedVideo?._id === video._id
                                ? "#eff6ff"
                                : "#ffffff",
                            color: "#111827",
                          }}
                        >
                          <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                            {video.title}
                          </div>

                          <div style={{ fontSize: "12px", color: "#6b7280" }}>
                            {selectedUploadedVideo?._id === video._id
                              ? "Now selected"
                              : "Click to play"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* HLS video player */}
                {selectedUploadedVideo && (
                  <section style={{ margin: "20px 0" }}>
                    <h3>{selectedUploadedVideo.title}</h3>
                    <video
                      ref={uploadedVideoRef}
                      controls
                      playsInline
                      style={{
                        width: "100%",
                        maxWidth: "900px",
                        aspectRatio: "16 / 9",
                        background: "#000",
                        borderRadius: "8px",
                      }}
                    />

                    {videoError && (
                      <p role="alert" style={{ color: "red" }}>
                        {videoError}
                      </p>
                    )}

                    <p>Status: {selectedUploadedVideo.processingStatus}</p>
                  </section>
                )}

                {!selectedUploadedVideo &&
                  (getYouTubeEmbedUrl(selectedLesson.videoUrl) ? (
                    <iframe
                      title={selectedLesson.title}
                      src={getYouTubeEmbedUrl(selectedLesson.videoUrl)}
                      width="100%"
                      style={{ aspectRatio: "16 / 9", border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <p>
                      Video cannot be embedded.{" "}
                      {selectedLesson.videoUrl && (
                        <a
                          href={selectedLesson.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open video
                        </a>
                      )}
                    </p>
                  ))}

                <button
                  type="button"
                  onClick={handleCompleteLesson}
                  disabled={
                    completing ||
                    isLessonCompleted ||
                    enrollment?.status === "completed"
                  }
                  style={{
                    marginTop: "16px",
                    padding: "12px 18px",
                    cursor: "pointer",
                  }}
                >
                  {completing
                    ? "Saving..."
                    : isLessonCompleted
                      ? "✓ Lesson Completed"
                      : "Mark as Complete"}
                </button>

                {lessonHasQuiz && (
                  <Link
                    to={`/quiz/${selectedLesson._id}`}
                    style={{
                      display: "inline-block",
                      marginTop: "16px",
                      marginLeft: "12px",
                      padding: "12px 18px",
                      textDecoration: "none",
                      border: "1px solid currentColor",
                      borderRadius: "6px",
                    }}
                  >
                    Take Quiz →
                  </Link>
                )}
              </>
            ) : (
              <p>Select a lesson to start learning.</p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
