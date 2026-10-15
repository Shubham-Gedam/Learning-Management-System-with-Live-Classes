import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.resolve("uploads/videos");

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname).toLowerCase()}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {

  const extension = path.extname(file.originalname).toLowerCase();

  const allowedExtensions = [".mp4", ".webm", ".mov"];

  if (allowedExtensions.includes(extension)) {
    return cb(null, true);
  }

  return cb(
    new Error("Only MP4, WebM and MOV video files are allowed")
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 1,
  },
});

export default upload;