const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// middleware
app.use(express.json());

// Mock user middleware (temporary for testing)
app.use((req, res, next) => {
  req.user = { id: "test-user-123" };
  next();
});

// db
if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.warn('MONGO_URI not set — skipping DB connection (testing mode)');
}

// routes
app.use("/", require("./routes/health.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/batch", require("./routes/batch.routes"));

// default route
app.get("/", (req, res) => {
  res.send("Batch-It Backend running 🚀");
});

// use environment-specified port with a sensible default
const PORT = process.env.PORT || 5050;

// start the HTTP server and handle common startup errors (such as EADDRINUSE)
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// propagate errors with a clear message and exit so that tooling (nodemon, etc.)
// doesn't continue trying to restart the same failing process.
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.\n` +
      "Please stop the other process or set a different PORT value.");
    process.exit(1);
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});


