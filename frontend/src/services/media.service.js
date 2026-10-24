import api from "./api";

const mediaService = {
  // Upload video (instructor/admin only)
  uploadVideo: async (formData, onUploadProgress) => {
    const response = await api.post("/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });

    return response.data;
  },

  // Get all media
  getAllMedia: async () => {
    const response = await api.get("/media");
    return response.data;
  },

  // Get media details
  getMediaById: async (mediaId) => {
    const response = await api.get(`/media/${mediaId}`);
    return response.data;
  },

  // Check video processing status
  getVideoProcessingStatus: async (mediaId) => {
    const response = await api.get(
      `/media/${mediaId}/processing-status`
    );
    return response.data;
  },

  // Delete media (instructor/admin only)
  deleteMedia: async (mediaId) => {
    const response = await api.delete(`/media/${mediaId}`);
    return response.data;
  },
};

export default mediaService;