import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Parse cookies
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`[Gateway Request] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LMS API Gateway is running",
    services: {
      auth: process.env.AUTH_SERVICE_URL,
      course: process.env.COURSE_SERVICE_URL,
      learning: process.env.LEARNING_SERVICE_URL,
      media: process.env.MEDIA_SERVICE_URL,
      liveClass: process.env.LIVE_CLASS_SERVICE_URL,
      payment: process.env.PAYMENT_SERVICE_URL,
      certificate: process.env.CERTIFICATE_SERVICE_URL,
    },
  });
});

// Proxy configuration
const services = [
  {
    path: "/api/auth",
    target: process.env.AUTH_SERVICE_URL,
  },
  {
    path: "/api/courses",
    target: process.env.COURSE_SERVICE_URL,
    changeOrigin: true,
  },
  {
    path: "/api/lessons",
    target: process.env.LEARNING_SERVICE_URL,
  },
  {
    path: "/api/learning",
    target: process.env.LEARNING_SERVICE_URL,
  },
  {
    path: "/api/quizzes",
    target: process.env.LEARNING_SERVICE_URL,
  },
  {
    path: "/api/quiz-attempts",
    target: process.env.LEARNING_SERVICE_URL,
  },
  {
    path: "/api/media",
    target: process.env.MEDIA_SERVICE_URL,
  },
  {
    path: "/api/live-classes",
    target: process.env.LIVE_CLASS_SERVICE_URL,
  },
  {
    path: "/api/payments",
    target: process.env.PAYMENT_SERVICE_URL,
  },
  {
    path: "/api/certificates",
    target: process.env.CERTIFICATE_SERVICE_URL,
  },
  {
    path: "/api/admin",
    target: process.env.AUTH_SERVICE_URL,
  },
];

// Register service proxies
for (const service of services) {
  if (!service.target) {
    throw new Error(`Missing service target for route: ${service.path}`);
  }

  app.use(
    createProxyMiddleware({
      target: service.target,
      changeOrigin: true,
      pathFilter: (path) => path.startsWith(service.path),
      proxyTimeout: 30000,
      timeout: 30000,
      on: {
        proxyReq(proxyReq, req) {
          console.log(
            `[Proxy] ${req.method} ${req.originalUrl} -> ${service.target}${proxyReq.path}`,
          );
        },
        proxyRes(proxyRes, req) {
          console.log(
            `[Proxy Response] ${req.method} ${req.originalUrl} -> ${proxyRes.statusCode}`,
          );
        },
        error(err, req, res) {
          console.error(`[Proxy Error] ${service.path}:`, err.message);

          if (!res.headersSent) {
            res.status(502).json({
              status: "error",
              message: "Service unavailable",
              service: service.path,
            });
          }
        },
      },
    }),
  );
}

// Gateway 404
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "API route not found in Gateway",
    path: req.originalUrl,
  });
});

// Start server
app.listen(8000, () => {
  console.log(`LMS API Gateway running on port 8000`);
});
