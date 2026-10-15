
import "dotenv/config";
import { Worker } from "bullmq";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import redisConnection from "../config/redis.js";
import connectDB from "../db/db.js";
import mediaModel from "../models/Media.model.js";
import s3Client from "../config/s3.js";

const bucketName = process.env.AWS_S3_BUCKET;

async function uploadHlsToS3(outputDirectory, videoId) {
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET is not configured");
  }

  const files = fs.readdirSync(outputDirectory);
  const prefix = `videos/${videoId}`;

  for (const file of files) {
    const filePath = path.join(outputDirectory, file);

    if (!fs.statSync(filePath).isFile()) {
      continue;
    }

    const key = `${prefix}/${file}`;

    let contentType = "application/octet-stream";

    if (file.endsWith(".m3u8")) {
      contentType = "application/vnd.apple.mpegurl";
    } else if (file.endsWith(".ts")) {
      contentType = "video/mp2t";
    }

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fs.createReadStream(filePath),
        ContentType: contentType,
      })
    );

    console.log(`Uploaded to S3: ${key}`);
  }

  return `${prefix}/index.m3u8`;
}

async function startWorker() {
  await connectDB();

  const videoWorker = new Worker(
    "video-processing",
    async (job) => {
      const { videoId, filePath } = job.data;

      console.log(`Processing HLS video job: ${job.id}`);

      const inputPath = path.resolve(filePath);
      const outputDirectory = path.resolve(
        "uploads",
        "processed",
        videoId
      );
      const playlistPath = path.join(
        outputDirectory,
        "index.m3u8"
      );

      try {
        await mediaModel.findByIdAndUpdate(videoId, {
          processingStatus: "processing",
        });

        if (!fs.existsSync(inputPath)) {
          throw new Error("Uploaded video file not found");
        }

        fs.mkdirSync(outputDirectory, { recursive: true });

        await new Promise((resolve, reject) => {
          const ffmpeg = spawn(
            process.env.FFMPEG_PATH || "ffmpeg",
            [
              "-y",
              "-i", inputPath,
              "-c:v", "libx264",
              "-preset", "medium",
              "-crf", "28",
              "-c:a", "aac",
              "-b:a", "128k",
              "-f", "hls",
              "-hls_time", "6",
              "-hls_playlist_type", "vod",
              "-hls_segment_filename",
              path.join(outputDirectory, "segment%03d.ts"),
              playlistPath,
            ]
          );

          ffmpeg.stderr.on("data", (data) => {
            console.log(data.toString());
          });

          ffmpeg.on("error", reject);

          ffmpeg.on("close", (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`FFmpeg exited with code ${code}`));
            }
          });
        });

        if (!fs.existsSync(playlistPath)) {
          throw new Error("HLS playlist was not generated");
        }

        // Upload playlist and all HLS segments to S3.
        const s3Key = await uploadHlsToS3(
          outputDirectory,
          videoId
        );

        const updatedMedia = await mediaModel.findByIdAndUpdate(
          videoId,
          {
            fileUrl: s3Key,
            processingStatus: "completed",
          },
          { returnDocument: "after" }
        );

        if (!updatedMedia) {
          throw new Error("Media record not found");
        }

        console.log(`HLS processing completed: ${videoId}`);
        console.log(`S3 playlist key: ${s3Key}`);

        return {
          videoId,
          processingStatus: "completed",
          s3Key,
          bucketName,
        };
      } catch (error) {
        await mediaModel.findByIdAndUpdate(videoId, {
          processingStatus: "failed",
        });

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 1,
    }
  );

  videoWorker.on("completed", (job, result) => {
    console.log(`Job ${job.id} completed:`, result);
  });

  videoWorker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error.message);
  });

  videoWorker.on("error", (error) => {
    console.error("Worker error:", error.message);
  });

  console.log("HLS + S3 video processing worker is running");
}

startWorker().catch((error) => {
  console.error("Worker startup failed:", error.message);
  process.exit(1);
});
