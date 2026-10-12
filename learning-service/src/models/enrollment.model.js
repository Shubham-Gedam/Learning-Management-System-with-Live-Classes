import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: String,
      required: [true, "Student ID is required"],
    },

    courseId: {
      type: String,
      required: [true, "Course ID is required"],
    },

    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be below 0"],
      max: [100, "Progress cannot exceed 100"],
    },

    completedLessons: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

enrollmentSchema.index(
  { student: 1, courseId: 1 },
  { unique: true }
);

const enrollmentModel = mongoose.model("Enrollment", enrollmentSchema);

export default enrollmentModel;