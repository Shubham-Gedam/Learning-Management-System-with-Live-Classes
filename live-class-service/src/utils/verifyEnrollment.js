export async function verifyEnrollment(studentId, courseId) {
  const serviceUrl = process.env.LEARNING_SERVICE_URL;
  const serviceSecret = process.env.INTERNAL_SERVICE_SECRET;

  if (!serviceUrl || !serviceSecret) {
    throw new Error("Learning Service configuration is missing");
  }

  const url = new URL("/api/learning/verify-enrollment", serviceUrl);

  url.searchParams.set("studentId", studentId);
  url.searchParams.set("courseId", courseId);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-internal-service-key": serviceSecret,
    },
  });

  if (!response.ok) {
    throw new Error(`Enrollment verification failed: ${response.status}`);
  }

  const result = await response.json();
  return result.data?.isEnrolled === true;
}