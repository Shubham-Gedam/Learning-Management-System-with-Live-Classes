import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export default function Quiz() {
  const { lessonId } = useParams();

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/quizzes/lesson/${lessonId}`);
        console.log("Lesson ID:", lessonId);
console.log("Quiz API response:", response.data);
        const data = response.data?.data;

        const quizList = Array.isArray(data)
          ? data
          : Array.isArray(data?.quizzes)
            ? data.quizzes
            : data?.quiz
              ? [data.quiz]
              : data?._id
                ? [data]
                : [];

        setQuizzes(quizList);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load quizzes.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, [lessonId]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedQuiz) return;

    const questions = selectedQuiz.questions || [];

    const unanswered = questions.some((question, index) => {
      const id = question._id || question.id || index;
      return answers[id] === undefined;
    });

    if (unanswered) {
      setError("Please answer every question before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setResult(null);

      const formattedAnswers = questions.map((question, index) => {
        const questionId = question._id || question.id || index;

        return {
          questionId: question._id || question.id,
          selectedOption: answers[questionId],
        };
      });

      const response = await api.post(
        `/quiz-attempts/${selectedQuiz._id}/submit`,
        { answers: formattedAnswers },
      );

      setResult(response.data?.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="page-container">
        <p className="page-message">Loading quizzes...</p>
      </main>
    );
  }

  return (
    <main className="page-container quiz-page">
      <div className="quiz-header">
        <Link to="/my-courses" className="quiz-back-link">
          ← Back to My Courses
        </Link>
        <h1>Lesson Quiz</h1>
        <p>Test your knowledge and track your learning progress.</p>
      </div>

      {error && (
        <div className="quiz-error" role="alert">
          {error}
        </div>
      )}

      {!selectedQuiz && quizzes.length > 0 && (
        <section className="quiz-list">
          <h2>Available Quizzes</h2>

          {quizzes.map((quiz) => (
            <article className="quiz-card" key={quiz._id}>
              <div>
                <h3>{quiz.title}</h3>
                <p>{quiz.description || "Test your understanding."}</p>
                <span className="quiz-count">
                  {quiz.questions?.length || 0} questions
                </span>
              </div>

              <button
                type="button"
                className="quiz-primary-button"
                onClick={() => {
                  console.log("Quiz selected:", quiz);
                  console.log(
                    "Selected question count:",
                    quiz.questions?.length,
                  );
                  setSelectedQuiz(quiz);
                  setAnswers({});
                  setResult(null);
                  setError("");
                }}
              >
                Start Quiz →
              </button>
            </article>
          ))}
        </section>
      )}

      {!selectedQuiz && quizzes.length === 0 && !error && (
        <div className="quiz-empty">
          <h2>No quizzes available</h2>
          <p>Your instructor has not added a quiz to this lesson yet.</p>
        </div>
      )}

      {selectedQuiz && (
        <section className="quiz-container">
          <div className="quiz-title-card">
            <span className="quiz-eyebrow">LESSON ASSESSMENT</span>
            <h2>{selectedQuiz.title}</h2>
            <p>{selectedQuiz.description}</p>
            <span className="quiz-count">
              {selectedQuiz.questions?.length || 0} questions
            </span>
          </div>

          {result ? (
            <div className="quiz-result">
              <div className="quiz-result-header">
                <div className="quiz-result-icon">
                  {result.passed ? "✓" : "✗"}
                </div>

                <h2>
                  {result.passed
                    ? "Congratulations! You Passed"
                    : "Keep Practicing!"}
                </h2>

                <p>
                  {result.passed
                    ? "You have successfully completed this quiz."
                    : "You did not reach the passing marks. Try again!"}
                </p>
              </div>

              <div className="quiz-result-score">
                <span>Your Score</span>

                <strong>
                  {result.score ?? 0} / {result.totalMarks ?? 0}
                </strong>

                <div className="quiz-result-progress">
                  <div
                    className="quiz-result-progress-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, Number(result.percentage) || 0),
                      )}%`,
                    }}
                  />
                </div>

                <strong>{result.percentage ?? 0}%</strong>
              </div>

              <div className="quiz-result-details">
                <div className="quiz-result-row">
                  <span>Status</span>
                  <strong>{result.passed ? "Passed" : "Failed"}</strong>
                </div>

                <div className="quiz-result-row">
                  <span>Total Marks</span>
                  <strong>{result.totalMarks ?? 0}</strong>
                </div>

                <div className="quiz-result-row">
                  <span>Attempt ID</span>
                  <strong>{result._id || result.attemptId || "—"}</strong>
                </div>
              </div>

              <button
                type="button"
                className="quiz-primary-button"
                onClick={() => {
                  setSelectedQuiz(null);
                  setAnswers({});
                  setResult(null);
                  setError("");
                }}
              >
                Back to Quizzes
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="quiz-form">
              {(selectedQuiz.questions || []).map((question, index) => {
                const questionId = question._id || question.id || index;
                console.log(
                  "Rendering quiz questions:",
                  selectedQuiz.questions,
                );
                const options = question.options || question.answers || [];

                return (
                  <fieldset className="quiz-question" key={questionId}>
                    <legend>
                      <span className="quiz-question-number">
                        Question {index + 1}
                      </span>
                      <span className="quiz-question-text">
                        {question.questionText ||
                          question.question ||
                          question.text ||
                          `Question ${index + 1}`}
                      </span>
                    </legend>

                    <div className="quiz-options">
                      {options.map((option, optionIndex) => {
                        const label =
                          typeof option === "string"
                            ? option
                            : option.text ||
                              option.label ||
                              option.option ||
                              "";

                        const isSelected = answers[questionId] === optionIndex;

                        return (
                          <label
                            className={`quiz-option ${
                              isSelected ? "selected" : ""
                            }`}
                            key={optionIndex}
                          >
                            <input
                              type="radio"
                              name={`question-${questionId}`}
                              value={optionIndex}
                              checked={isSelected}
                              onChange={() => {
                                setAnswers((previous) => ({
                                  ...previous,
                                  [questionId]: optionIndex,
                                }));
                                setError("");
                              }}
                            />

                            <span className="quiz-option-letter">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>

                            <span className="quiz-option-text">{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}

              <div className="quiz-submit-area">
                <p>Answer all questions before submitting your quiz.</p>

                <button
                  type="submit"
                  className="quiz-primary-button quiz-submit-button"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Quiz →"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </main>
  );
}
