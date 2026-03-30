const express = require("express");
const { isDatabaseReady, isMemoryModeEnabled } = require("../config/db");

const router = express.Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Batch-It API is healthy.",
    data: {
      database: isDatabaseReady() ? "mongo" : "memory",
      fallbackMode: isMemoryModeEnabled(),
    },
  });
});

module.exports = router;
