import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },

    instructor: {
      type: String,
      required: [true, "Instructor ID is required"],
    },

    category: {
      type: String,
      required: [true, "Course category is required"],
      trim: true,
    },

    thumbnail: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Course price cannot be negative"],
      default: 0,
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const courseModel = mongoose.model("Course", courseSchema);

export default courseModel;