const {
  addItemToBatch,
  closeBatch,
  createBatch,
  findBatchById,
  getAllBatches,
  removeItemFromBatch,
} = require("../repositories/batch.repository");
const { emitBatchUpdated } = require("../socket/socket");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const {
  isNonEmptyString,
  isPositiveNumber,
  parseValidDate,
} = require("../utils/validation");

const validateItemPayload = ({ name, quantity, price }) => {
  if (!isNonEmptyString(name)) {
    return "Item name is required.";
  }

  if (!isPositiveNumber(quantity)) {
    return "Quantity must be a positive number.";
  }

  if (!isPositiveNumber(price)) {
    return "Price must be a positive number.";
  }

  return null;
};

const buildBatchSummary = (batch) =>
  (batch.items || []).reduce(
    (summary, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;

      summary.totalItems += quantity;
      summary.totalAmount += quantity * price;
      return summary;
    },
    {
      batchId: batch._id,
      totalItems: 0,
      totalAmount: 0,
    }
  );

const getActorId = (value) => value?._id?.toString?.() || value?.id || value;

const isBatchExpired = (batch) => {
  const expiresAt = new Date(batch?.expiresAt).getTime();
  return Number.isFinite(expiresAt) && expiresAt <= Date.now();
};

const getBatchSummary = asyncHandler(async (req, res) => {
  const batch = await findBatchById(req.params.batchId);

  if (!batch) {
    throw new AppError("Batch not found.", 404);
  }

  return sendSuccess(res, {
    message: "Batch summary loaded.",
    data: buildBatchSummary(batch),
  });
});

const getAllBatchRecords = asyncHandler(async (_req, res) => {
  const batches = await getAllBatches();

  return sendSuccess(res, {
    message: "Batches loaded successfully.",
    data: batches,
    meta: {
      count: batches.length,
    },
  });
});

const getBatchById = asyncHandler(async (req, res) => {
  const batch = await findBatchById(req.params.batchId);

  if (!batch) {
    throw new AppError("Batch not found.", 404);
  }

  return sendSuccess(res, {
    message: "Batch loaded successfully.",
    data: batch,
  });
});

const createBatchRecord = asyncHandler(async (req, res) => {
  const { buildingId, restaurantName, expiresAt, items = [] } = req.body;
  const parsedExpiry = parseValidDate(expiresAt);

  if (!isNonEmptyString(buildingId)) {
    throw new AppError("Building or delivery location is required.", 400);
  }

  if (!isNonEmptyString(restaurantName)) {
    throw new AppError("Restaurant name is required.", 400);
  }

  if (!parsedExpiry) {
    throw new AppError("A valid expiresAt date is required.", 400);
  }

  if (parsedExpiry.getTime() <= Date.now()) {
    throw new AppError("expiresAt must be in the future.", 400);
  }

  const normalizedItems = Array.isArray(items) ? items : [];
  for (const item of normalizedItems) {
    const validationMessage = validateItemPayload(item || {});

    if (validationMessage) {
      throw new AppError(validationMessage, 400);
    }
  }

  const batch = await createBatch({
    initiator: req.user.id,
    buildingId: String(buildingId).trim(),
    restaurantName: String(restaurantName).trim(),
    expiresAt: parsedExpiry.toISOString(),
    items: normalizedItems.map((item) => ({
      name: String(item.name).trim(),
      quantity: Number(item.quantity),
      price: Number(item.price),
      user: req.user.id,
    })),
  });

  emitBatchUpdated(batch, "batch_created");

  return sendSuccess(res, {
    statusCode: 201,
    message: "Batch created successfully.",
    data: batch,
  });
});

const addItem = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const validationMessage = validateItemPayload(req.body);

  if (validationMessage) {
    throw new AppError(validationMessage, 400);
  }

  const existingBatch = await findBatchById(batchId);

  if (!existingBatch) {
    throw new AppError("Batch not found.", 404);
  }

  if (existingBatch.status === "CLOSED") {
    throw new AppError("This batch is already closed.", 400);
  }

  if (isBatchExpired(existingBatch)) {
    throw new AppError("This batch has passed its deadline and can no longer be edited.", 400);
  }

  const updatedBatch = await addItemToBatch(batchId, {
    name: String(req.body.name).trim(),
    quantity: Number(req.body.quantity),
    price: Number(req.body.price),
    user: req.user.id,
  });

  emitBatchUpdated(updatedBatch, "item_added");

  return sendSuccess(res, {
    message: "Item added successfully.",
    data: updatedBatch,
  });
});

const removeItem = asyncHandler(async (req, res) => {
  const { batchId, itemId } = req.params;
  const batch = await findBatchById(batchId);

  if (!batch) {
    throw new AppError("Batch not found.", 404);
  }

  const itemExists = (batch.items || []).some((item) => item._id === itemId);

  if (!itemExists) {
    throw new AppError("Item not found.", 404);
  }

  if (batch.status === "CLOSED") {
    throw new AppError("Closed batches cannot be edited.", 400);
  }

  if (isBatchExpired(batch)) {
    throw new AppError("This batch has passed its deadline and can no longer be edited.", 400);
  }

  const targetItem = (batch.items || []).find((item) => item._id === itemId);
  const actorId = getActorId(req.user.id);
  const initiatorId = getActorId(batch.initiator);
  const itemOwnerId = getActorId(targetItem?.user);

  if (actorId !== initiatorId && actorId !== itemOwnerId) {
    throw new AppError("You can only remove your own items unless you created the batch.", 403);
  }

  const updatedBatch = await removeItemFromBatch(batchId, itemId);
  emitBatchUpdated(updatedBatch, "item_removed");

  return sendSuccess(res, {
    message: "Item removed successfully.",
    data: updatedBatch,
  });
});

const closeBatchRecord = asyncHandler(async (req, res) => {
  const batch = await findBatchById(req.params.batchId);

  if (!batch) {
    throw new AppError("Batch not found.", 404);
  }

  if (batch.status === "CLOSED") {
    throw new AppError("Batch is already closed.", 400);
  }

  if (getActorId(batch.initiator) !== getActorId(req.user.id)) {
    throw new AppError("Only the batch creator can close this batch.", 403);
  }

  const updatedBatch = await closeBatch(req.params.batchId);
  emitBatchUpdated(updatedBatch, "batch_closed");

  return sendSuccess(res, {
    message: "Batch closed successfully.",
    data: updatedBatch,
  });
});

module.exports = {
  addItem,
  closeBatchRecord,
  createBatchRecord,
  getAllBatchRecords,
  getBatchById,
  getBatchSummary,
  removeItem,
};
