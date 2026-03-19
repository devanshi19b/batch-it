const mongoose = require("mongoose");
const Batch = require("../models/batch");
const { isDatabaseReady } = require("../config/db");
const {
  createId,
  sortByCreatedAtDesc,
  store,
  timestamp,
  toPlainObject,
} = require("../data/memoryStore");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeBatch = (batch) => {
  if (!batch) {
    return null;
  }

  if (typeof batch.toObject === "function") {
    return batch.toObject();
  }

  return toPlainObject(batch);
};

const getAllBatchRecords = async () => {
  if (isDatabaseReady()) {
    const batches = await Batch.find().sort({ createdAt: -1 });
    return batches.map(normalizeBatch);
  }

  return sortByCreatedAtDesc(store.batches).map(toPlainObject);
};

const findBatchById = async (batchId) => {
  if (!isValidObjectId(batchId)) {
    return null;
  }

  if (isDatabaseReady()) {
    const batch = await Batch.findById(batchId);
    return normalizeBatch(batch);
  }

  const batch = store.batches.find((entry) => entry._id === batchId);
  return batch ? toPlainObject(batch) : null;
};

const createBatchRecord = async ({ initiator, buildingId, restaurantName, items, expiresAt }) => {
  if (isDatabaseReady()) {
    const batch = await Batch.create({
      initiator,
      buildingId,
      restaurantName,
      items,
      expiresAt,
    });

    return normalizeBatch(batch);
  }

  const now = timestamp();
  const batch = {
    _id: createId(),
    initiator,
    buildingId,
    restaurantName,
    items: (items || []).map((item) => ({
      _id: createId(),
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      user: item.user,
    })),
    status: "LIVE",
    expiresAt,
    createdAt: now,
    updatedAt: now,
  };

  store.batches.push(batch);

  return toPlainObject(batch);
};

const addItemToBatchRecord = async (batchId, item) => {
  if (!isValidObjectId(batchId)) {
    return null;
  }

  if (isDatabaseReady()) {
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return null;
    }

    batch.items.push(item);
    await batch.save();
    return normalizeBatch(batch);
  }

  const batch = store.batches.find((entry) => entry._id === batchId);

  if (!batch) {
    return null;
  }

  batch.items.push({
    _id: createId(),
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    user: item.user,
  });
  batch.updatedAt = timestamp();

  return toPlainObject(batch);
};

const removeItemFromBatchRecord = async (batchId, itemId) => {
  if (!isValidObjectId(batchId)) {
    return null;
  }

  if (isDatabaseReady()) {
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return null;
    }

    batch.items = batch.items.filter(
      (item) => item._id.toString() !== itemId
    );
    await batch.save();
    return normalizeBatch(batch);
  }

  const batch = store.batches.find((entry) => entry._id === batchId);

  if (!batch) {
    return null;
  }

  batch.items = batch.items.filter((item) => item._id !== itemId);
  batch.updatedAt = timestamp();

  return toPlainObject(batch);
};

const closeBatchRecord = async (batchId) => {
  if (!isValidObjectId(batchId)) {
    return null;
  }

  if (isDatabaseReady()) {
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return null;
    }

    batch.status = "CLOSED";
    await batch.save();
    return normalizeBatch(batch);
  }

  const batch = store.batches.find((entry) => entry._id === batchId);

  if (!batch) {
    return null;
  }

  batch.status = "CLOSED";
  batch.updatedAt = timestamp();

  return toPlainObject(batch);
};

module.exports = {
  addItemToBatchRecord,
  closeBatchRecord,
  createBatchRecord,
  findBatchById,
  getAllBatchRecords,
  removeItemFromBatchRecord,
};
