const express = require("express");
const router = express.Router();

const {
  createBatch,
  getAllBatches,
  getBatchById,
  addItemToBatch,
  removeItemFromBatch,
  closeBatch,
  getBatchSummary
} = require("../controllers/batch.controller");

const { protect } = require("../middleware/auth.middleware");

// Public routes (no login required)
router.get("/", getAllBatches);
router.get("/:batchId", getBatchById);
router.get("/:batchId/summary", getBatchSummary);

// Protected routes (login required)
router.post("/create", protect, createBatch);
router.post("/:batchId/items", protect, addItemToBatch);
router.delete("/:batchId/items/:itemId", protect, removeItemFromBatch);
router.patch("/:batchId/close", protect, closeBatch);

module.exports = router;