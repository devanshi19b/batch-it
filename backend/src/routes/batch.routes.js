const express = require("express");
const {
  addItem,
  closeBatchRecord,
  createBatchRecord,
  getAllBatchRecords,
  getBatchById,
  getBatchSummary,
  removeItem,
} = require("../controllers/batch.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", getAllBatchRecords);
router.get("/:batchId", getBatchById);
router.get("/:batchId/summary", getBatchSummary);

router.post("/create", protect, createBatchRecord);
router.post("/:batchId/items", protect, addItem);
router.delete("/:batchId/items/:itemId", protect, removeItem);
router.patch("/:batchId/close", protect, closeBatchRecord);

module.exports = router;
