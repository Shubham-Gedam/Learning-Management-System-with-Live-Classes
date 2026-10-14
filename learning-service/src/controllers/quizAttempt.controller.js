import mongoose from "mongoose";
import quizModel from "../models/Quiz.model.js";
import quizAttemptModel from "../models/QuizAttempt.model.js";
import enrollmentModel from "../models/enrollment.model.js";

// Submit quiz answers and calculate score automatically
export async function submitQuizAttemptController(req, res) {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    if (!mongoose.isValidObjectId(quizId)) {
      return res.status(400).json({
        message: "Invalid quiz ID",
        status: "failed",
      });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "Answers are required",
        status: "failed",
      });
    }

    const quiz = await quizModel.findOne({
      _id: quizId,
      isPublished: true,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Published quiz not found",
        status: "failed",
      });
    }
    // Verify that the student is enrolled in the quiz's course.
    const enrollment = await enrollmentModel.findOne({
      student: req.user.userId,
      courseId: quiz.courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You must be enrolled in this course to attempt the quiz",
        status: "failed",
      });
    }

    // Prevent duplicate answers and validate submitted question IDs.
    const questionIds = quiz.questions.map((question) =>
      question._id.toString(),
    );
    const submittedIds = answers.map((answer) => answer.questionId?.toString());

    if (
      submittedIds.some((id) => !id) ||
      new Set(submittedIds).size !== submittedIds.length ||
      submittedIds.some((id) => !questionIds.includes(id))
    ) {
      return res.status(400).json({
        message: "Answers contain invalid or duplicate question IDs",
        status: "failed",
      });
    }

    for (const answer of answers) {
      if (
        !Number.isInteger(answer.selectedOption) ||
        answer.selectedOption < 0
      ) {
        return res.status(400).json({
          message: "Each selected option must be a non-negative integer",
          status: "failed",
        });
      }

      const question = quiz.questions.id(answer.questionId);

      if (!question || answer.selectedOption >= question.options.length) {
        return res.status(400).json({
          message: "Selected option does not exist for a question",
          status: "failed",
        });
      }
    }

    let score = 0;
    const evaluatedAnswers = [];

    for (const answer of answers) {
      const question = quiz.questions.id(answer.questionId);
      const isCorrect = answer.selectedOption === question.correctAnswer;

      if (isCorrect) {
        score += question.marks;
      }

      evaluatedAnswers.push({
        questionId: question._id,
        selectedOption: answer.selectedOption,
      });
    }

    const totalMarks = quiz.questions.reduce(
      (total, question) => total + question.marks,
      0,
    );

    const percentage =
      totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    const passed = score >= quiz.passingMarks;

    const attempt = await quizAttemptModel.create({
      quizId: quiz._id,
      studentId: req.user.userId,
      answers: evaluatedAnswers,
      score,
      totalMarks,
      percentage,
      passed,
    });

    return res.status(201).json({
      message: "Quiz submitted and graded successfully",
      status: "success",
      data: {
        attemptId: attempt._id,
        quizId: attempt.quizId,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        passed: attempt.passed,
        submittedAt: attempt.submittedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to submit quiz",
      error: error.message,
      status: "failed",
    });
  }
}

// Get the logged-in student's attempts for a quiz
export async function getMyQuizAttemptsController(req, res) {
  try {
    const { quizId } = req.params;

    if (!mongoose.isValidObjectId(quizId)) {
      return res.status(400).json({
        message: "Invalid quiz ID",
        status: "failed",
      });
    }

    const attempts = await quizAttemptModel
      .find({
        quizId,
        studentId: req.user.userId,
      })
      .select("-answers")
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      message: "Quiz attempts fetched successfully",
      status: "success",
      results: attempts.length,
      data: attempts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch quiz attempts",
      status: "failed",
    });
  }
}
