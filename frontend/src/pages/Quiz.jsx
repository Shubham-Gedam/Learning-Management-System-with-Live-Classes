import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Sparkles, AlertCircle, HelpCircle, Check, X, Award } from "lucide-react";

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
      <div className="bg-[#0B0B0B] text-white min-h-screen flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-orange-500 font-bold text-lg animate-pulse">
          <Sparkles className="w-6 h-6" /> Loading quizzes...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans px-6 lg:px-16 py-12">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="space-y-4 border-b border-neutral-900 pb-6">
          <Link to="/my-courses" className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-orange-500 transition-colors uppercase tracking-wider bg-neutral-900/60 border border-neutral-800 px-4 py-2 rounded-full">
            <ArrowLeft className="w-4 h-4" /> Back to My Courses
          </Link>

          <div className="space-y-1">
            <span className="text-orange-500 text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> LESSON ASSESSMENT
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Lesson Quiz
            </h1>
            <p className="text-sm text-neutral-400">
              Test your knowledge and track your learning mastery progress.
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Quizzes List Selection */}
        {!selectedQuiz && quizzes.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-orange-500" /> Available Quizzes
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {quizzes.map((quiz) => (
                <article className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl hover:border-orange-500/40 transition-all" key={quiz._id}>
                  <div className="space-y-2">
                    <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-block">
                      {quiz.questions?.length || 0} Questions Assessment
                    </span>
                    <h3 className="text-xl font-bold text-white">{quiz.title}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">{quiz.description || "Test your understanding of the concepts covered in this lesson."}</p>
                  </div>

                  <button
                    type="button"
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-6 py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-orange-600/20 shrink-0 flex items-center gap-1.5"
                    onClick={() => {
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
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedQuiz && quizzes.length === 0 && !error && (
          <div className="text-center py-20 bg-[#141414] border border-neutral-800 rounded-2xl space-y-3 max-w-lg mx-auto">
            <h2 className="text-lg font-bold text-white">No quizzes available</h2>
            <p className="text-xs text-neutral-400">Your instructor has not added an assessment quiz to this lesson yet.</p>
          </div>
        )}

        {/* Active Quiz & Result Area */}
        {selectedQuiz && (
          <div className="space-y-8">
            
            {/* Quiz Title Banner */}
            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-2 shadow-xl">
              <span className="text-orange-500 text-[10px] font-bold tracking-[0.2em] uppercase">ASSESSMENT ACTIVE</span>
              <h2 className="text-2xl font-black text-white">{selectedQuiz.title}</h2>
              <p className="text-xs text-neutral-400">{selectedQuiz.description}</p>
              <span className="inline-block pt-2 text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                {selectedQuiz.questions?.length || 0} Questions Total
              </span>
            </div>

            {/* Quiz Result Card */}
            {result ? (
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-8 space-y-8 shadow-2xl">
                
                {/* Result Header */}
                <div className="text-center space-y-3 border-b border-neutral-800 pb-6">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto text-xl font-bold ${
                    result.passed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    {result.passed ? <Check className="w-7 h-7" /> : <X className="w-7 h-7" />}
                  </div>

                  <h2 className="text-2xl font-black text-white">
                    {result.passed ? "Congratulations! You Passed" : "Keep Practicing!"}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {result.passed ? "You have successfully demonstrated mastery over this lesson." : "You did not reach the passing marks threshold. Review the material and try again!"}
                  </p>
                </div>

                {/* Score Breakdown Box */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 uppercase tracking-wider font-semibold">Your Score</span>
                    <strong className="text-xl font-black text-white">
                      {result.score ?? 0} / {result.totalMarks ?? 0}
                    </strong>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-neutral-950 border border-neutral-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.passed ? "bg-emerald-500" : "bg-orange-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, Number(result.percentage) || 0),
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="text-right text-xs font-bold text-orange-400">
                    {result.percentage ?? 0}% Score
                  </div>
                </div>

                {/* Result Rows Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl text-center space-y-1">
                    <span className="text-neutral-500 block uppercase tracking-wider text-[10px]">Status</span>
                    <strong className={`font-bold ${result.passed ? "text-emerald-400" : "text-red-400"}`}>
                      {result.passed ? "Passed" : "Failed"}
                    </strong>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl text-center space-y-1">
                    <span className="text-neutral-500 block uppercase tracking-wider text-[10px]">Total Marks</span>
                    <strong className="font-bold text-white">{result.totalMarks ?? 0}</strong>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl text-center space-y-1">
                    <span className="text-neutral-500 block uppercase tracking-wider text-[10px]">Attempt ID</span>
                    <strong className="font-mono text-neutral-300 truncate block">{result._id || result.attemptId || "—"}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2"
                  onClick={() => {
                    setSelectedQuiz(null);
                    setAnswers({});
                    setResult(null);
                    setError("");
                  }}
                >
                  Back to Quizzes List
                </button>
              </div>
            ) : (
              /* Quiz Questions Form */
              <form onSubmit={handleSubmit} className="space-y-8">
                {(selectedQuiz.questions || []).map((question, index) => {
                  const questionId = question._id || question.id || index;
                  const options = question.options || question.answers || [];

                  return (
                    <fieldset className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl" key={questionId}>
                      <legend className="w-full float-none pb-4 border-b border-neutral-800/80 mb-4 flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                          Question {index + 1}
                        </span>
                        <span className="text-xs text-neutral-500 font-mono">
                          {question.marks || 1} Mark{(question.marks || 1) > 1 ? "s" : ""}
                        </span>
                      </legend>

                      <h3 className="text-base font-bold text-white leading-relaxed">
                        {question.questionText ||
                          question.question ||
                          question.text ||
                          `Question ${index + 1}`}
                      </h3>

                      <div className="space-y-3 pt-2">
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
                              className={`flex items-center gap-4 p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-orange-600/10 border-orange-500 text-white font-semibold"
                                  : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
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
                                className="accent-orange-500 w-4 h-4"
                              />

                              <span className="w-6 h-6 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center font-bold text-orange-400 text-[11px] shrink-0">
                                {String.fromCharCode(65 + optionIndex)}
                              </span>

                              <span className="flex-1 leading-normal">{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  );
                })}

                {/* Submit Area */}
                <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <p className="text-xs text-neutral-400">Please verify all answers before final submission.</p>

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all shadow-xl shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting Quiz..." : "Submit Quiz Assessment →"}
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
}