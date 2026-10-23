
import api from "./api";

// Fetch upcoming live classes
export function getUpcomingClasses() {
  return api.get("/live-classes/upcoming");
}

// Fetch classes created by the logged-in instructor
export function getMyLiveClasses() {
  return api.get("/live-classes/my-classes");
}

// Request a LiveKit join token for a class
export function joinLiveClass(classId) {
  return api.post(
    `/live-classes/${encodeURIComponent(classId)}/join-token`
  );
}

// Schedule a live class (instructor/admin)
export function createLiveClass(classData) {
  return api.post("/live-classes", classData);
}

export function updateLiveClassStatus(classId, status) {
  return api.patch(
    `/live-classes/${encodeURIComponent(classId)}/status`,
    { status }
  );
}
