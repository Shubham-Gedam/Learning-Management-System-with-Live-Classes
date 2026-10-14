import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: [true, "Course ID is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    videoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: [0, "Duration cannot be negative"],
    },
    order: {
      type: Number,
      required: [true, "Lesson order is required"],
      min: [1, "Lesson order must be at least 1"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

lessonSchema.index(
  { courseId: 1, order: 1 },
  { unique: true }
);

const lessonModel = mongoose.model("Lesson", lessonSchema);

export default lessonModel;
