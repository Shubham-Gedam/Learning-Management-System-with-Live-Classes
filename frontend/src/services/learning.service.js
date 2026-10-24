import api from "./api";

const learningService = {
  // Enroll in a course
  enrollInCourse: async (courseId) => {
    const response = await api.post("/learning/enroll", { courseId });
    return response.data;
  },

  // Get logged-in student's courses
  getMyCourses: async () => {
    const response = await api.get("/learning/my-courses");
    return response.data;
  },

  // Get an enrollment and its progress
  getEnrollmentById: async (enrollmentId) => {
    const response = await api.get(`/learning/${enrollmentId}`);
    return response.data;
  },

  // Mark a lesson as complete
  markLessonComplete: async (enrollmentId, lessonId) => {
    const response = await api.patch(
      `/learning/${enrollmentId}/complete-lesson`,
      { lessonId }
    );
    return response.data;
  },

  // Get published lessons for a course
  getCourseLessons: async (courseId) => {
    const response = await api.get(`/lessons/course/${courseId}`);
    return response.data;
  },

  // Get published quizzes for a lesson
  getLessonQuizzes: async (lessonId) => {
    const response = await api.get(`/quizzes/lesson/${lessonId}`);
    return response.data;
  },

  // Submit a quiz attempt
  submitQuizAttempt: async (quizId, answers) => {
    const response = await api.post(`/quiz-attempts/${quizId}/submit`, {
      answers,
    });
    return response.data;
  },

  // Get the student's attempts for a quiz
  getMyQuizAttempts: async (quizId) => {
    const response = await api.get(
      `/quiz-attempts/${quizId}/my-attempts`
    );
    return response.data;
  },
};

export default learningService;