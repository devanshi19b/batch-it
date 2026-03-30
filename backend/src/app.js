const express = require("express");
const authRoutes = require("./routes/auth.routes");
const batchRoutes = require("./routes/batch.routes");
const healthRoutes = require("./routes/health.routes");
const { errorHandler, notFound } = require("./middleware/error.middleware");

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Batch-It API is running.",
  });
});

app.use("/", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/batches", batchRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
