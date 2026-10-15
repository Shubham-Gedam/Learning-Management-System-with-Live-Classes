import "dotenv/config";
import { HeadBucketCommand } from "@aws-sdk/client-s3";
import s3Client from "./src/config/s3.js";

async function testS3Connection() {
  try {
    await s3Client.send(
      new HeadBucketCommand({
        Bucket: process.env.AWS_S3_BUCKET,
      })
    );

    console.log("S3 bucket connection successful!");
  } catch (error) {
    console.error("S3 connection failed:", error.name);
    console.error("Message:", error.message);
  }
}

testS3Connection();