import api from "./api";

const courseService = {
  getAllCourses: async () => {
    const response = await api.get("/courses");
    return response.data;
  },

  getCourseById: async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await api.post("/courses", courseData);
    return response.data;
  },

  updateCourse: async (courseId, courseData) => {
    const response = await api.patch(`/courses/${courseId}`, courseData);
    return response.data;
  },

  deleteCourse: async (courseId) => {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  },
};

export default courseService;