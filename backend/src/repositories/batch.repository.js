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

const sanitizeUserReference = (user) => {
  if (!user) {
    return null;
  }

  const userId = user._id?.toString?.() || user.id || user;

  return {
    id: userId,
    name: user.name || "Unknown user",
    email: user.email || "",
    role: user.role || "student",
  };
};

const enrichUserReference = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "object" && (value._id || value.id)) {
    return sanitizeUserReference(value);
  }

  const match = store.users.find((entry) => {
    const entryId = entry._id?.toString?.() || entry.id;
    const lookupId = value._id?.toString?.() || value.id || value;
    return entryId === lookupId;
  });

  return sanitizeUserReference(match || value);
};

const normalizeBatch = (batch) => {
  if (!batch) {
    return null;
  }

  if (typeof batch.toObject === "function") {
    return batch.toObject();
  }

  return toPlainObject(batch);
};

const enrichBatchUsers = (batch) => {
  if (!batch) {
    return null;
  }

  return {
    ...batch,
    initiator: enrichUserReference(batch.initiator),
    items: (batch.items || []).map((item) => ({
      ...item,
      user: enrichUserReference(item.user),
    })),
  };
};

const populateBatchQuery = (query) =>
  query.populate("initiator", "name email role").populate("items.user", "name email role");

const getAllBatchRecords = async () => {
  if (isDatabaseReady()) {
    const batches = await populateBatchQuery(Batch.find().sort({ createdAt: -1 }));
    return batches.map((batch) => enrichBatchUsers(normalizeBatch(batch)));
  }

  return sortByCreatedAtDesc(store.batches).map((batch) =>
    enrichBatchUsers(toPlainObject(batch))
  );
};

const findBatchById = async (batchId) => {
  if (!isValidObjectId(batchId)) {
    return null;
  }

  if (isDatabaseReady()) {
    const batch = await populateBatchQuery(Batch.findById(batchId));
    return enrichBatchUsers(normalizeBatch(batch));
  }

  const batch = store.batches.find((entry) => entry._id === batchId);
  return batch ? enrichBatchUsers(toPlainObject(batch)) : null;
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

    return findBatchById(batch._id.toString());
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

  return enrichBatchUsers(toPlainObject(batch));
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
    return findBatchById(batchId);
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

  return enrichBatchUsers(toPlainObject(batch));
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
    return findBatchById(batchId);
  }

  const batch = store.batches.find((entry) => entry._id === batchId);

  if (!batch) {
    return null;
  }

  batch.items = batch.items.filter((item) => item._id !== itemId);
  batch.updatedAt = timestamp();

  return enrichBatchUsers(toPlainObject(batch));
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
    return findBatchById(batchId);
  }

  const batch = store.batches.find((entry) => entry._id === batchId);

  if (!batch) {
    return null;
  }

  batch.status = "CLOSED";
  batch.updatedAt = timestamp();

  return enrichBatchUsers(toPlainObject(batch));
};

module.exports = {
  addItemToBatchRecord,
  closeBatchRecord,
  createBatchRecord,
  findBatchById,
  getAllBatchRecords,
  removeItemFromBatchRecord,
};
