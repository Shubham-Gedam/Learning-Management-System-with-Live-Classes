import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import certificateRoutes from "./routes/certificate.route.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Certificate Service is running",
  });
});

app.use("/api/certificates", certificateRoutes);

export default app;