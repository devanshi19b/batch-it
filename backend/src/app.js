const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/auth.routes");
const batchRoutes = require("./routes/batch.routes");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/batches", batchRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Batch-It Backend Running 🚀");
});

module.exports = app;