const express = require("express");
const router = express.Router();

const { createBatch } = require("../controllers/batch.controller");

router.post("/create", createBatch);

module.exports = router;
