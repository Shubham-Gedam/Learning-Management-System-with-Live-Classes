import videoQueue from "./src/queues/video.queue.js";

try {
  const job = await videoQueue.add("test-video", {
    videoId: "test-video-123",
    title: "MERN Introduction",
  });

  console.log("Test job added successfully!");
  console.log("Job ID:", job.id);
} catch (error) {
  console.error("Failed to add test job:", error.message);
} finally {
  await videoQueue.close();
}