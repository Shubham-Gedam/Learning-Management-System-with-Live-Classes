
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const createEmptyQuestion = () => ({
  questionText: "",
  options: ["", ""],
  correctAnswer: 0,
  marks: 1,
});

export default function CreateQuiz() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passingMarks, setPassingMarks] = useState(1);
  const [questions, setQuestions] = useState([createEmptyQuestion()]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [createdQuiz, setCreatedQuiz] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await api.get("/courses/my");
        const items = response.data.courses || [];
        setCourses(items);

        if (items.length > 0) {
          setCourseId(items[0]._id);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load your courses."
        );
      } finally {
        setLoadingCourses(false);
      }
    }

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!courseId) {
      setLessons([]);
      setLessonId("");
      return;
    }

    let cancelled = false;

    async function fetchLessons() {
      try {
        setLoadingLessons(true);
        setError("");
        setLessons([]);
        setLessonId("");

        const response = await api.get(
          `/lessons/course/${courseId}`
        );

        const data = response.data.data || response.data.lessons || [];

        if (!cancelled) {
          setLessons(data);
          if (data.length > 0) {
            setLessonId(data[0]._id);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load lessons for this course."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingLessons(false);
        }
      }
    }

    fetchLessons();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  function updateQuestion(questionIndex, field, value) {
    setQuestions((previous) =>
      previous.map((question, index) =>
        index === questionIndex
          ? { ...question, [field]: value }
          : question
      )
    );
  }

  function updateOption(questionIndex, optionIndex, value) {
    setQuestions((previous) =>
      previous.map((question, index) => {
        if (index !== questionIndex) return question;

        return {
          ...question,
          options: question.options.map((option, currentIndex) =>
            currentIndex === optionIndex ? value : option
          ),
        };
      })
    );
  }

  function addQuestion() {
    setQuestions((previous) => [
      ...previous,
      createEmptyQuestion(),
    ]);
  }

  function removeQuestion(questionIndex) {
    setQuestions((previous) =>
      previous.filter((_, index) => index !== questionIndex)
    );
  }

  function addOption(questionIndex) {
    setQuestions((previous) =>
      previous.map((question, index) =>
        index === questionIndex
          ? { ...question, options: [...question.options, ""] }
          : question
      )
    );
  }

  function removeOption(questionIndex, optionIndex) {
    setQuestions((previous) =>
      previous.map((question, index) => {
        if (index !== questionIndex) return question;

        const options = question.options.filter(
          (_, currentIndex) => currentIndex !== optionIndex
        );

        let correctAnswer = question.correctAnswer;
        if (correctAnswer === optionIndex) correctAnswer = 0;
        else if (correctAnswer > optionIndex) correctAnswer -= 1;

        return { ...question, options, correctAnswer };
      })
    );
  }

  async function handleCreateQuiz(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setCreatedQuiz(null);

    if (!courseId || !lessonId) {
      setError("Please select a course and lesson.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a quiz title.");
      return;
    }

    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index];

      if (!question.questionText.trim()) {
        setError(`Please enter text for Question ${index + 1}.`);
        return;
      }

      if (
        question.options.length < 2 ||
        question.options.some((option) => !option.trim())
      ) {
        setError(
          `Question ${index + 1} must have at least two non-empty options.`
        );
        return;
      }

      if (
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length
      ) {
        setError(
          `Select a correct answer for Question ${index + 1}.`
        );
        return;
      }
    }

    const totalMarks = questions.reduce(
      (total, question) => total + Number(question.marks),
      0
    );

    const passMarkNumber = Number(passingMarks);

    if (
      !Number.isFinite(passMarkNumber) ||
      passMarkNumber < 0 ||
      passMarkNumber > totalMarks
    ) {
      setError(`Passing marks must be between 0 and ${totalMarks}.`);
      return;
    }

    const payload = {
      courseId,
      lessonId,
      title: title.trim(),
      description: description.trim(),
      passingMarks: passMarkNumber,
      questions: questions.map((question) => ({
        questionText: question.questionText.trim(),
        options: question.options.map((option) => option.trim()),
        correctAnswer: Number(question.correctAnswer),
        marks: Number(question.marks),
      })),
    };

    try {
      setSaving(true);

      const response = await api.post("/quizzes", payload);
      const quiz = response.data.data;

      setCreatedQuiz(quiz);
      setMessage(response.data.message || "Quiz created successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to create quiz. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!createdQuiz?._id) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await api.patch(
        `/quizzes/${createdQuiz._id}/publish`,
        { isPublished: true }
      );

      setCreatedQuiz(response.data.data || {
        ...createdQuiz,
        isPublished: true,
      });

      setMessage("Quiz published successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to publish the quiz."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loadingCourses) {
    return <main className="page-container"><p>Loading courses...</p></main>;
  }

  return (
    <main className="page-container">
      <h1>Create Quiz</h1>
      <p>Create a quiz for one of your courses and lessons.</p>

      <p>
        <Link to="/instructor/dashboard">← Back to Dashboard</Link>
      </p>

      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
      {message && <p role="status" style={{ color: "green" }}>{message}</p>}

      {createdQuiz ? (
        <section className="dashboard-card">
          <h2>{createdQuiz.title}</h2>
          <p>
            Status: {createdQuiz.isPublished ? "Published" : "Unpublished"}
          </p>

          {!createdQuiz.isPublished && (
            <button
              type="button"
              className="register-btn"
              onClick={handlePublish}
              disabled={saving}
            >
              {saving ? "Publishing..." : "Publish Quiz"}
            </button>
          )}

          <button
            type="button"
            className="register-btn"
            onClick={() => navigate("/instructor/dashboard")}
            style={{ marginLeft: 8 }}
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            className="register-btn"
            onClick={() => {
              setCreatedQuiz(null);
              setMessage("");
              setTitle("");
              setDescription("");
              setPassingMarks(1);
              setQuestions([createEmptyQuestion()]);
            }}
            style={{ marginLeft: 8 }}
          >
            Create Another Quiz
          </button>
        </section>
      ) : (
        <form onSubmit={handleCreateQuiz}>
          <div className="dashboard-card">
            <label htmlFor="quiz-course">Course</label>
            <select
              id="quiz-course"
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              required
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>

            {courses.length === 0 && (
              <p>Create a course first before making a quiz.</p>
            )}

            <label htmlFor="quiz-lesson">Lesson</label>
            <select
              id="quiz-lesson"
              value={lessonId}
              onChange={(event) => setLessonId(event.target.value)}
              disabled={loadingLessons || lessons.length === 0}
              required
            >
              <option value="">
                {loadingLessons ? "Loading lessons..." : "Select lesson"}
              </option>
              {lessons.map((lesson) => (
                <option key={lesson._id} value={lesson._id}>
                  {lesson.title}
                </option>
              ))}
            </select>

            {!loadingLessons && courseId && lessons.length === 0 && (
              <p>This course has no lessons available yet.</p>
            )}

            <label htmlFor="quiz-title">Quiz title</label>
            <input
              id="quiz-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. MERN Stack Basics Quiz"
              required
            />

            <label htmlFor="quiz-description">Description</label>
            <textarea
              id="quiz-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe this quiz (optional)"
              rows={3}
            />

            <label htmlFor="passing-marks">Passing marks</label>
            <input
              id="passing-marks"
              type="number"
              min="0"
              max={questions.reduce(
                (total, question) => total + Number(question.marks || 0),
                0
              )}
              value={passingMarks}
              onChange={(event) => setPassingMarks(event.target.value)}
              required
            />
          </div>

          <h2>Questions</h2>

          {questions.map((question, questionIndex) => (
            <section className="dashboard-card" key={questionIndex}>
              <h3>Question {questionIndex + 1}</h3>

              <label>Question text</label>
              <textarea
                value={question.questionText}
                onChange={(event) =>
                  updateQuestion(
                    questionIndex,
                    "questionText",
                    event.target.value
                  )
                }
                placeholder="Enter your question"
                rows={3}
                required
              />

              <label>Options</label>

              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} style={{ marginBottom: 10 }}>
                  <input
                    value={option}
                    onChange={(event) =>
                      updateOption(
                        questionIndex,
                        optionIndex,
                        event.target.value
                      )
                    }
                    placeholder={`Option ${optionIndex + 1}`}
                    required
                  />

                  <label style={{ display: "inline-flex", gap: 6, margin: "8px 12px" }}>
                    <input
                      type="radio"
                      name={`correct-answer-${questionIndex}`}
                      checked={question.correctAnswer === optionIndex}
                      onChange={() =>
                        updateQuestion(
                          questionIndex,
                          "correctAnswer",
                          optionIndex
                        )
                      }
                    />
                    Correct answer
                  </label>

                  {question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(questionIndex, optionIndex)}
                    >
                      Remove option
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addOption(questionIndex)}
              >
                + Add Option
              </button>

              <div style={{ marginTop: 12 }}>
                <label>Marks</label>
                <input
                  type="number"
                  min="1"
                  value={question.marks}
                  onChange={(event) =>
                    updateQuestion(
                      questionIndex,
                      "marks",
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  style={{ marginTop: 12 }}
                >
                  Remove Question
                </button>
              )}
            </section>
          ))}

          <button type="button" onClick={addQuestion}>
            + Add Question
          </button>

          <div style={{ marginTop: 20 }}>
            <button
              type="submit"
              className="register-btn"
              disabled={saving || !courses.length || !lessonId}
            >
              {saving ? "Creating Quiz..." : "Create Quiz"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
