const {
  addItemToBatchRecord,
  closeBatchRecord,
  createBatchRecord,
  findBatchById,
  getAllBatchRecords,
  removeItemFromBatchRecord,
} = require("../repositories/batch.repository");
const {
  isNonEmptyString,
  isPositiveNumber,
  parseValidDate,
} = require("../utils/validation");

const serializeBatch = (batch) => ({
  ...batch,
  _id: batch._id?.toString?.() || batch._id,
  initiator: batch.initiator?.toString?.() || batch.initiator,
  items: (batch.items || []).map((item) => ({
    ...item,
    _id: item._id?.toString?.() || item._id,
    user: item.user?.toString?.() || item.user,
  })),
});

const validateItemPayload = ({ name, quantity, price }) => {
  if (!isNonEmptyString(name)) {
    return "Item name is required";
  }

  if (!isPositiveNumber(quantity)) {
    return "Item quantity must be a positive number";
  }

  if (!isPositiveNumber(price)) {
    return "Item price must be a positive number";
  }

  return null;
};

exports.removeItemFromBatch = async (req, res) => {
  try {
    const { batchId, itemId } = req.params;
    const batch = await findBatchById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    if (batch.status === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Cannot remove items from a CLOSED batch",
      });
    }

    const itemExists = batch.items.some(
      (item) => (item._id?.toString?.() || item._id) === itemId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const updatedBatch = await removeItemFromBatchRecord(batchId, itemId);

    res.status(200).json({
      success: true,
      message: "Item removed successfully",
      data: serializeBatch(updatedBatch),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getBatchSummary = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await findBatchById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    let totalItems = 0;
    let totalAmount = 0;

    const items = Array.isArray(batch.items) ? batch.items : [];

    items.forEach((item) => {
      totalItems += Number(item.quantity) || 0;
      totalAmount += (Number(item.quantity) || 0) * (Number(item.price) || 0);
    });

    res.status(200).json({
      success: true,
      batchId: batch._id?.toString?.() || batch._id,
      totalItems,
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.closeBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await findBatchById(batchId);

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

    const updatedBatch = await closeBatchRecord(batchId);

    return res.status(200).json({
      success: true,
      message: "Batch closed successfully",
      data: serializeBatch(updatedBatch),
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
    const batch = await findBatchById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: serializeBatch(batch),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addItemToBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { name, quantity, price } = req.body;
    const validationMessage = validateItemPayload({ name, quantity, price });

    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    const batch = await findBatchById(batchId);

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

    const updatedBatch = await addItemToBatchRecord(batchId, {
      name: name.trim(),
      quantity: Number(quantity),
      price: Number(price),
      user: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Item added successfully",
      data: serializeBatch(updatedBatch),
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
    const parsedExpiresAt = parseValidDate(expiresAt);

    if (!isNonEmptyString(buildingId) || !isNonEmptyString(restaurantName) || !expiresAt) {
      return res.status(400).json({
        success: false,
        message: "buildingId, restaurantName and expiresAt are required",
      });
    }

    if (!parsedExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiresAt date format",
      });
    }

    const normalizedItems = Array.isArray(items) ? items : [];

    for (const item of normalizedItems) {
      const validationMessage = validateItemPayload(item || {});
      if (validationMessage) {
        return res.status(400).json({
          success: false,
          message: validationMessage,
        });
      }
    }

    const batch = await createBatchRecord({
      initiator: req.user.id,
      buildingId: buildingId.trim(),
      restaurantName: restaurantName.trim(),
      items: normalizedItems.map((item) => ({
        name: item.name.trim(),
        quantity: Number(item.quantity),
        price: Number(item.price),
        user: req.user.id,
      })),
      expiresAt: parsedExpiresAt.toISOString(),
    });

    return res.status(201).json({
      success: true,
      data: serializeBatch(batch),
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
    const batches = await getAllBatchRecords();

    return res.status(200).json({
      success: true,
      count: batches.length,
      data: batches.map(serializeBatch),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
