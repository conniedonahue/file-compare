import express from "express";
import multer from "multer";
import { parseController } from "./controllers/parseController.js";
import { compareController } from "./controllers/compareController.js";

const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post(
  "/compare/",
  upload.fields([{ name: "file1" }, { name: "file2" }]),
  parseController.handleRequest,
  compareController.handleRequest,
  (req, res) => {
    return res.json("done");
  }
);

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
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}

export default app;
