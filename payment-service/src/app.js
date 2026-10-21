import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import paymentRoutes from "./routes/payment.route.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Payment Service is running",
    status: "success",
  });
});

app.use("/api/payments", paymentRoutes);

export default app;