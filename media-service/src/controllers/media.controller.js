import path from "path";
import mediaModel from "../models/Media.model.js";
import videoQueue from "../queues/video.queue.js";

// 1. Create media metadata
export async function createMediaController(req, res) {
  try {
    const { title, description, mediaType, fileUrl, publicId, courseId } =
      req.body;

    if (!title || !mediaType || !fileUrl) {
      return res.status(400).json({
        message: "Title, media type and file URL are required",
        status: "failed",
      });
    }

    if (!["video", "image", "document"].includes(mediaType)) {
      return res.status(400).json({
        message: "Invalid media type",
        status: "failed",
      });
    }

    const media = await mediaModel.create({
      title,
      description,
      mediaType,
      fileUrl,
      publicId,
      courseId,
      uploadedBy: req.user.userId,
    });

    return res.status(201).json({
      message: "Media created successfully",
      status: "success",
      data: media,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create media",
      error: error.message,
      status: "failed",
    });
  }
}

// 2. Get all active media
export async function getAllMediaController(req, res) {
  try {
    const { courseId, mediaType, lessonId } = req.query;

    const filter = { isActive: true };

    if (courseId) filter.courseId = courseId;
    if (mediaType) {
      if (!["video", "image", "document"].includes(mediaType)) {
        return res.status(400).json({
          message: "Invalid media type filter",
          status: "failed",
        });
      }

      filter.mediaType = mediaType;
    }
    if (lessonId) {
      filter.lessonId = lessonId;
    }

    const media = await mediaModel.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Media fetched successfully",
      status: "success",
      results: media.length,
      data: media,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch media",
      status: "failed",
    });
  }
}

// 3. Get one media item
export async function getMediaByIdController(req, res) {
  try {
    const media = await mediaModel.findOne({
      _id: req.params.mediaId,
      isActive: true,
    });

    if (!media) {
      return res.status(404).json({
        message: "Media not found",
        status: "failed",
      });
    }

    return res.status(200).json({
      message: "Media fetched successfully",
      status: "success",
      data: media,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid media ID",
        status: "failed",
      });
    }

    return res.status(500).json({
      message: "Failed to fetch media",
      status: "failed",
    });
  }
}

// 4. Soft-delete media
export async function deleteMediaController(req, res) {
  try {
    const media = await mediaModel.findOne({
      _id: req.params.mediaId,
      isActive: true,
    });

    if (!media) {
      return res.status(404).json({
        message: "Media not found",
        status: "failed",
      });
    }

    if (media.uploadedBy !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You cannot delete this media",
        status: "failed",
      });
    }

    media.isActive = false;
    await media.save();

    return res.status(200).json({
      message: "Media deleted successfully",
      status: "success",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid media ID",
        status: "failed",
      });
    }

    return res.status(500).json({
      message: "Failed to delete media",
      status: "failed",
    });
  }
}

// 5. Upload an actual video file
export async function uploadVideoController(req, res) {
  let uploadedMedia = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a video file",
        status: "failed",
      });
    }

    const { title, description, courseId } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Video title is required",
        status: "failed",
      });
    }

    const fileUrl = `/uploads/videos/${path.basename(req.file.path)}`;

    uploadedMedia = await mediaModel.create({
      title: title.trim(),
      description: description || "",
      mediaType: "video",
      fileUrl,
      publicId: "",
      courseId: courseId || null,
      uploadedBy: req.user.userId,
      processingStatus: "pending",
    });

    const job = await videoQueue.add("process-video", {
      videoId: uploadedMedia._id.toString(),
      filePath: req.file.path,
      title: uploadedMedia.title,
    });

    return res.status(201).json({
      message: "Video uploaded and processing job queued",
      status: "success",
      data: {
        media: uploadedMedia,
        jobId: job.id,
      },
    });
  } catch (error) {
    console.error("Video upload error:", error);

    return res.status(500).json({
      message: uploadedMedia
        ? "Video uploaded, but processing job could not be queued"
        : "Failed to upload video",
      error: error.message,
      status: "failed",
    });
  }
}

// 6. Check video processing status
export async function getVideoProcessingStatusController(req, res) {
  try {
    const media = await mediaModel
      .findOne({
        _id: req.params.mediaId,
        mediaType: "video",
        isActive: true,
      })
      .select("title fileUrl processingStatus");

    if (!media) {
      return res.status(404).json({
        message: "Video not found",
        status: "failed",
      });
    }

    return res.status(200).json({
      message: "Video processing status fetched successfully",
      status: "success",
      data: media,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid media ID",
        status: "failed",
      });
    }

    return res.status(500).json({
      message: "Failed to fetch video processing status",
      status: "failed",
    });
  }
}

export async function attachMediaToLessonController(req, res) {
  try {
    const { mediaId } = req.params;
    const { lessonId } = req.body;

    if (!lessonId || !String(lessonId).trim()) {
      return res.status(400).json({
        message: "Lesson ID is required",
        status: "failed",
      });
    }

    const media = await mediaModel.findOne({
      _id: mediaId,
      isActive: true,
      mediaType: "video",
    });

    if (!media) {
      return res.status(404).json({
        message: "Video not found",
        status: "failed",
      });
    }

    if (media.uploadedBy !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You cannot modify this video",
        status: "failed",
      });
    }

    if (media.processingStatus !== "completed") {
      return res.status(400).json({
        message: "Wait until video processing is completed",
        status: "failed",
      });
    }

    media.lessonId = String(lessonId).trim();
    await media.save();

    return res.status(200).json({
      message: "Video linked to lesson successfully",
      status: "success",
      data: media,
    });
  } catch (error) {
    console.error("Attach media to lesson error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid media ID",
        status: "failed",
      });
    }

    return res.status(500).json({
      message: "Failed to link video to lesson",
      status: "failed",
    });
  }
}
