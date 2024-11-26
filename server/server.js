import express from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { parseController } from "./controllers/parseController.js";
import { compareController } from "./controllers/compareController.js";
import { LimitFileSizeError } from "./errors/errors.js";
import { MAX_FILE_SIZE } from "../constants/maxFileSize.js";

// Initialize Express application
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle file uploads in memory with size limits
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE * 1024 * 1024,
  },
});

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
});

app.use(apiLimiter);

// Define /compare/ route
app.post(
  "/compare/",
  apiLimiter,
  upload.fields([{ name: "file1" }, { name: "file2" }]),
  parseController.handleRequest,
  compareController.handleRequest,
  (req, res) => {
    return res.json("done");
  }
);

// Error handler for file size limits
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return next(new LimitFileSizeError());
  }
  next(err);
});

// Catch-all handler for undefined routes
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const errorResponse = {
    ...err,
    message: err.message || "Internal Server Error",
    code: err.name || "UNKNOWN_ERROR",
  };
  return res.status(status).json(errorResponse);
});

// Start the server if not in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

export default app;
