import express from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { parseController } from "./controllers/parseController.js";
import { compareController } from "./controllers/compareController.js";
import { LimitFileSizeError } from "./errors/errors.js";

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
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

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return next(new LimitFileSizeError());
  }
  next(err);
});

app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const errorResponse = {
    ...err,
    message: err.message || "Internal Server Error",
    code: err.name || "UNKNOWN_ERROR",
  };
  return res.status(status).json(errorResponse);
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

export default app;
