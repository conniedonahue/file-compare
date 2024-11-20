import express from "express";
import multer from "multer";
import { fileParseController } from "./controllers/fileParseController.js";

const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post(
  "/compare/",
  upload.fields([{ name: "file1" }, { name: "file2" }]),
  (req, res, next) => {
    console.log("files: ", req.files); // Logs the parsed files and their keys
    next();
  },
  fileParseController.handleRequest, 
  (req, res) => {
    return res.json("done")
  }
);

app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
    status: status,
  });
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
