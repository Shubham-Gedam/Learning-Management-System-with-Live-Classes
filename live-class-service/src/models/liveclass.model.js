import mongoose from "mongoose";

const liveClassSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Class title is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    courseId: {
      type: String,
      required: [true, "Course ID is required"],
    },

    instructorId: {
      type: String,
      required: [true, "Instructor ID is required"],
    },

    scheduledAt: {
      type: Date,
      required: [true, "Scheduled date and time are required"],
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: [1, "Duration must be at least 1 minute"],
      default: 60,
    },

    meetingUrl: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const liveClassModel = mongoose.model("LiveClass", liveClassSchema);

export default liveClassModel;