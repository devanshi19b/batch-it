const mongoose = require("mongoose");
const Batch = require("../models/batch");

// REMOVE ITEM FROM BATCH
exports.removeItemFromBatch = async (req, res) => {
  try {
    const { batchId, itemId } = req.params;

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    // check if batch is closed
    if (batch.status === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Cannot remove items from a CLOSED batch"
      });
    }

    // find item index
    const itemIndex = batch.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    // remove item
    batch.items.splice(itemIndex, 1);

    await batch.save();

    res.status(200).json({
      success: true,
      message: "Item removed successfully",
      data: batch
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET BATCH SUMMARY
exports.getBatchSummary = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    let totalItems = 0;
    let totalAmount = 0;

    batch.items.forEach((item) => {
      totalItems += item.quantity;
      totalAmount += item.quantity * item.price;
    });

    res.status(200).json({
      success: true,
      batchId: batch._id,
      totalItems,
      totalAmount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ CLOSE BATCH
exports.closeBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Check if already closed
    if (batch.status === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Batch is already closed",
      });
    }

    // Update status
    batch.status = "CLOSED";
    await batch.save();

    return res.status(200).json({
      success: true,
      message: "Batch closed successfully",
      data: batch,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET SINGLE BATCH BY ID
exports.getBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: batch
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ ADD ITEM TO EXISTING BATCH
exports.addItemToBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { name, quantity, price } = req.body;

    // Validate required fields
    if (!name || !quantity || !price) {
      return res.status(400).json({
        success: false,
        message: "name, quantity and price are required",
      });
    }

    // Find batch
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Check if batch is LIVE
    if (batch.status !== "LIVE") {
      return res.status(400).json({
        success: false,
        message: "Cannot add items to a CLOSED batch",
      });
    }

    // Add item
    batch.items.push({
      name,
      quantity,
      price,
      user: req.user.id // temporary user
    });

    await batch.save();

    return res.status(200).json({
      success: true,
      message: "Item added successfully",
      data: batch,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ CREATE BATCH
exports.createBatch = async (req, res) => {
  try {
    const { buildingId, restaurantName, items, expiresAt } = req.body;

    // Required fields check
    if (!buildingId || !restaurantName || !expiresAt) {
      return res.status(400).json({
        success: false,
        message: "buildingId, restaurantName and expiresAt are required",
      });
    }

    // Validate Date
    if (isNaN(new Date(expiresAt))) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiresAt date format",
      });
    }

    // Temporary: generate valid ObjectId for initiator (until auth ready)
    const validUserId = new mongoose.Types.ObjectId();

    const batch = await Batch.create({
      initiator: req.user.id,
      buildingId,
      restaurantName,
      items,
      expiresAt,
    });

    return res.status(201).json({
      success: true,
      data: batch,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET ALL BATCHES
exports.getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: batches.length,
      data: batches,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};