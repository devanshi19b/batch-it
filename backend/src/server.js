const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// middleware
app.use(express.json());

// Mock user middleware (temporary for testing)
//app.use((req, res, next) => {
  //req.user = { id: "test-user-123" };
  //next();
//});

// DB connection
if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.warn("MONGO_URI not set — skipping DB connection (testing mode)");
}

// routes
app.use("/", require("./routes/health.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/batch", require("./routes/batch.routes")); // ✅ fixed

// default route
app.get("/", (req, res) => {
  res.send("Batch-It Backend running 🚀");
});

// server start
const PORT = process.env.PORT || 5050;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use.\nPlease stop the other process or set a different PORT value.`
    );
    process.exit(1);
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});

