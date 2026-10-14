
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (options) =>
          options.length >= 2 && options.every((option) => option.trim()),
        message: "A question must have at least two non-empty options",
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, "Correct answer index is required"],
      min: 0,
    },
    marks: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: true }
);

questionSchema.pre("validate", function () {
  if (
    Number.isInteger(this.correctAnswer) &&
    this.options &&
    this.correctAnswer >= this.options.length
  ) {
    this.invalidate(
      "correctAnswer",
      "Correct answer index must match an available option"
    );
  }
});

const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: [true, "Course ID is required"],
      trim: true,
    },
    lessonId: {
      type: String,
      required: [true, "Lesson ID is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (questions) => questions.length > 0,
        message: "A quiz must contain at least one question",
      },
    },
    passingMarks: {
      type: Number,
      default: 1,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

quizSchema.index({ lessonId: 1 });

const quizModel = mongoose.model("Quiz", quizSchema);

export default quizModel;
