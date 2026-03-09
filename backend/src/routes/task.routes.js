const express = require("express");
const router = express.Router();

// Task routes placeholder. Implement actual handlers in `src/controllers/task.controller.js`.
router.get("/", (req, res) => {
  res.status(200).json({ message: "Task routes placeholder" });
});

module.exports = router;
