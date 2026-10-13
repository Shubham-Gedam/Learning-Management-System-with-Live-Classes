import mediaModel from "../models/Media.model.js";

// 1. Create media metadata
export async function createMediaController(req, res) {
  try {
    const {title,description,mediaType,fileUrl,publicId,courseId,} = req.body;

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
    const { courseId, mediaType } = req.query;

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

    const media = await mediaModel
      .find(filter)
      .sort({ createdAt: -1 });

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

    if (
      media.uploadedBy !== req.user.userId &&
      req.user.role !== "admin"
    ) {
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