const COURSE_SERVICE_URL =
  process.env.COURSE_SERVICE_URL || "http://localhost:3002";

export async function verifyCourseOwnership(courseId, userId) {
  const url = `${COURSE_SERVICE_URL}/api/courses/${courseId}`;

  try {
    console.log("Checking course ownership:", url);

    const response = await fetch(url);
    const responseText = await response.text();


    if (!response.ok) {
      throw new Error(
        `Course Service returned HTTP ${response.status}`
      );
    }

    const result = JSON.parse(responseText);
    const course = result.course;

    if (!course) {
      return { exists: false, isOwner: false };
    }

    return {
      exists: true,
      isOwner: String(course.instructor) === String(userId),
    };
  } catch (error) {
    console.error("Course ownership verification failed:", error);

    throw new Error(
      `Course Service verification failed: ${error.message}`
    );
  }
}