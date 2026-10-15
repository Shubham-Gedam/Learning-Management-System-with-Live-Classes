import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Media title is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    mediaType: {
      type: String,
      enum: ["video", "image", "document"],
      required: [true, "Media type is required"],
    },

    fileUrl: {
      type: String,
      required: [true, "Media file URL is required"],
      trim: true,
    },

    publicId: {
      type: String,
      default: "",
    },

    courseId: {
      type: String,
      default: null,
    },

    uploadedBy: {
      type: String,
      required: [true, "Uploader ID is required"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const mediaModel = mongoose.model("Media", mediaSchema);

export default mediaModel;