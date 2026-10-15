import { Queue } from "bullmq";
import redisConnection from "../config/redis.js";

const videoQueue = new Queue("video-processing", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

videoQueue.on("error", (error) => {
  console.error("Video queue error:", error.message);
});

export default videoQueue;