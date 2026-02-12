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
connectDB();

// routes
app.use("/", require("./routes/health.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/batches", require("./routes/batch.routes"));

// default route
app.get("/", (req, res) => {
  res.send("Batch-It Backend running 🚀");
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


