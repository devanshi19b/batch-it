const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Tasks endpoint is available",
    data: [],
  });
});

module.exports = router;
