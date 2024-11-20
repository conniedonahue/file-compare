import express from "express";

const app = express();
const port = 3000;

app.use('/compare/', compareController)

app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(stats).json({
    message: err.message || "Internal Server Error",
    status: status,
  });
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
