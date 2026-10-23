import api from "./api";

// Publicly verify a certificate
export function getCertificate(certificateId) {
  return api.get(
    `/certificates/verify/${encodeURIComponent(certificateId)}`
  );
}

// Get certificates belonging to the logged-in student
export function getMyCertificates() {
  return api.get("/certificates/my-certificates");
}

// Download certificate PDF (authentication required)
export function downloadCertificate(certificateId) {
  return api.get(
    `/certificates/${encodeURIComponent(certificateId)}/download`,
    {
      responseType: "blob",
    }
  );
}

// Request certificate issuance
export function issueCertificate(courseId, details) {
  return api.post("/certificates/issue", {
    courseId,
    studentName: details.studentName,
    courseName: details.courseName,
  });
}
