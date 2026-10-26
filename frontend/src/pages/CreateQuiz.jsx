import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Sparkles, CheckCircle2, AlertCircle, Plus, Trash2, HelpCircle, Check } from "lucide-react";

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
    return (
      <div className="bg-[#0B0B0B] text-white min-h-screen flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-orange-500 font-bold text-lg animate-pulse">
          <Sparkles className="w-6 h-6" /> Loading courses...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans px-6 lg:px-16 py-12">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Back Link & Header */}
        <div className="space-y-4 border-b border-neutral-900 pb-6">
          <Link 
            to="/instructor/dashboard" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-orange-500 transition-colors uppercase tracking-wider bg-neutral-900/60 border border-neutral-800 px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="space-y-1">
            <span className="text-orange-500 text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> INSTRUCTOR STUDIO
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Create Quiz
            </h1>
            <p className="text-sm text-neutral-400">
              Create a structured auto-graded quiz for your course lessons.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        {message && (
          <div role="status" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}

        {createdQuiz ? (
          <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-8 space-y-6 shadow-2xl text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">{createdQuiz.title}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                createdQuiz.isPublished ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}>
                Status: {createdQuiz.isPublished ? "Published" : "Unpublished"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              {!createdQuiz.isPublished && (
                <button
                  type="button"
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-orange-600/20"
                  onClick={handlePublish}
                  disabled={saving}
                >
                  {saving ? "Publishing..." : "Publish Quiz"}
                </button>
              )}

              <button
                type="button"
                className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 font-semibold px-6 py-3 rounded-xl text-xs transition-all"
                onClick={() => navigate("/instructor/dashboard")}
              >
                Back to Dashboard
              </button>

              <button
                type="button"
                className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 font-semibold px-6 py-3 rounded-xl text-xs transition-all"
                onClick={() => {
                  setCreatedQuiz(null);
                  setMessage("");
                  setTitle("");
                  setDescription("");
                  setPassingMarks(1);
                  setQuestions([createEmptyQuestion()]);
                }}
              >
                Create Another Quiz
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateQuiz} className="space-y-8">
            
            {/* Quiz General Info Card */}
            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800/80 pb-4">
                <HelpCircle className="w-5 h-5 text-orange-500" /> Quiz Settings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="quiz-course" className="text-xs font-semibold text-neutral-300">Course *</label>
                  <select
                    id="quiz-course"
                    value={courseId}
                    onChange={(event) => setCourseId(event.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  {courses.length === 0 && (
                    <p className="text-[11px] text-amber-500 pt-1">Create a course first before making a quiz.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="quiz-lesson" className="text-xs font-semibold text-neutral-300">Lesson *</label>
                  <select
                    id="quiz-lesson"
                    value={lessonId}
                    onChange={(event) => setLessonId(event.target.value)}
                    disabled={loadingLessons || lessons.length === 0}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition disabled:opacity-50"
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
                    <p className="text-[11px] text-amber-500 pt-1">This course has no lessons available yet.</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="quiz-title" className="text-xs font-semibold text-neutral-300">Quiz title *</label>
                <input
                  id="quiz-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. MERN Stack Basics Quiz"
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="quiz-description" className="text-xs font-semibold text-neutral-300">Description</label>
                <textarea
                  id="quiz-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe this quiz (optional)"
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition resize-none"
                />
              </div>

              <div className="space-y-1.5 max-w-xs">
                <label htmlFor="passing-marks" className="text-xs font-semibold text-neutral-300">Passing marks *</label>
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
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            {/* Questions Builder Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                <h3 className="text-xl font-bold text-white">Questions</h3>
                <span className="text-xs text-neutral-400">{questions.length} Questions Added</span>
              </div>

              {questions.map((question, questionIndex) => (
                <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl" key={questionIndex}>
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                    <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wider">Question {questionIndex + 1}</h4>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Question
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Question text *</label>
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
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition resize-none"
                    />
                  </div>

                  {/* Options Builder */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold text-neutral-300 block">Options & Correct Answer *</label>

                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-neutral-900/60 border border-neutral-800 p-3.5 rounded-xl">
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
                          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition"
                        />

                        <div className="flex items-center justify-between sm:justify-start gap-4">
                          <label className="inline-flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
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
                              className="accent-orange-500"
                            />
                            Correct answer
                          </label>

                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(questionIndex, optionIndex)}
                              className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-lg"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addOption(questionIndex)}
                      className="bg-neutral-900 hover:bg-neutral-800 text-orange-400 border border-neutral-800 font-semibold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Option
                    </button>
                  </div>

                  {/* Marks Input */}
                  <div className="space-y-1.5 max-w-xs pt-2">
                    <label className="text-xs font-semibold text-neutral-300">Marks *</label>
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
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addQuestion}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 hover:border-neutral-700 font-bold py-3.5 rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-orange-500" /> Add Another Question
              </button>
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-4 rounded-xl text-sm transition-all duration-300 shadow-xl shadow-orange-600/20 disabled:opacity-50"
                disabled={saving || !courses.length || !lessonId}
              >
                {saving ? "Creating Quiz..." : "Create Quiz →"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}