import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";
import paymentRouter from "./routes/payment.route.js";

dotenv.config();

const app = express();

// Set request timeout to 120 seconds (well before Render's 31-second limit)
const REQUEST_TIMEOUT = 120000; // 120 seconds

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://three-interviewiq-client-6ubi.onrender.com",
  "https://three-interviewiq-09da.onrender.com" // backend URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow if origin is in whitelist
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // For development, allow any localhost origin
      if (origin.includes("localhost")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400 // 24 hours
};

// CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(REQUEST_TIMEOUT);
  res.setTimeout(REQUEST_TIMEOUT);
  
  // Set keep-alive headers
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=60, max=100");
  
  next();
});

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Debug endpoint to check authentication
app.get("/api/debug/auth", (req, res) => {
  console.log("Debug auth endpoint - Cookies:", req.cookies);
  console.log("Debug auth endpoint - Headers:", req.headers);
  res.json({
    cookies: req.cookies,
    headers: Object.keys(req.headers),
    timestamp: new Date().toISOString()
  });
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`);
  });
  
  next();
});

// Error handling for async middleware
app.use((req, res, next) => {
  res.on("error", (err) => {
    console.error("Response error:", err);
  });
  next();
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Node environment: ${process.env.NODE_ENV || "development"}`);
  connectDb();
});

// Handle server errors
server.on("error", (err) => {
  console.error("Server error:", err);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});