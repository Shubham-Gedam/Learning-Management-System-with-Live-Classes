import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  const [enrollment, setEnrollment] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState("");
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
        const [
          courseResponse,
          lessonResponse,
          enrollmentResponse,
        ] = await Promise.all([
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
    2
  )
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
          setError(
            "Your enrollment was not found. Please check My Learning."
          );
        }
      } catch (err) {
        console.error("Load course error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load the course. Please try again."
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
    (lesson) => String(lesson._id) === String(selectedLessonId)
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
        const response = await api.get(
          `/quizzes/lesson/${selectedLesson._id}`
        );

        const responseData = response.data?.data;

        const quiz = Array.isArray(responseData)
          ? responseData[0]
          : responseData?.quiz || responseData;

        if (isMounted) {
          setLessonHasQuiz(
            Boolean(quiz?._id || quiz?.id)
          );
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
    ? completedLessons.some(
        (id) => String(id) === String(selectedLesson._id)
      )
    : false;

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
        { lessonId: selectedLesson._id }
      );

      const updatedEnrollment =
        response.data.data || response.data.enrollment;

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

      setMessage(
        response.data.message || "Lesson marked as completed."
      );
    } catch (err) {
      console.error("Complete lesson error:", err);

      setError(
        err.response?.data?.message ||
          "Could not mark this lesson as completed."
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
                (id) => String(id) === String(lesson._id)
              );

              return (
                <button
                  key={lesson._id}
                  type="button"
                  onClick={() => {
                    setSelectedLessonId(lesson._id);
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

                <p>
                  {selectedLesson.description || "Course lesson"}
                </p>

                {getYouTubeEmbedUrl(selectedLesson.videoUrl) ? (
                  <iframe
                    title={selectedLesson.title}
                    src={getYouTubeEmbedUrl(
                      selectedLesson.videoUrl
                    )}
                    width="100%"
                    style={{
                      aspectRatio: "16 / 9",
                      border: 0,
                    }}
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
                )}

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
