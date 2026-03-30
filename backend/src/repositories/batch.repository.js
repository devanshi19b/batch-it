const mongoose = require("mongoose");
const Batch = require("../models/Batch");
const { isMemoryModeEnabled } = require("../config/db");
const { clone, createId, store, timestamp } = require("../utils/memoryStore");

const serializeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user._id?.toString?.() || user.id || user._id || user,
    name: user.name || "Unknown user",
    email: user.email || "",
    role: user.role || "member",
  };
};

const findMemoryUser = (value) => {
  const userId = value?._id?.toString?.() || value?.id || value;
  return store.users.find((entry) => entry._id === userId) || null;
};

const normalizeMongoBatch = (batch) => {
  if (!batch) {
    return null;
  }

  const plain = typeof batch.toObject === "function" ? batch.toObject() : batch;

  return {
    ...plain,
    _id: plain._id?.toString?.() || plain._id,
    initiator: serializeUser(plain.initiator),
    items: (plain.items || []).map((item) => ({
      ...item,
      _id: item._id?.toString?.() || item._id,
      user: serializeUser(item.user),
    })),
  };
};

const normalizeMemoryBatch = (batch) => {
  if (!batch) {
    return null;
  }

  const plain = clone(batch);

  return {
    ...plain,
    initiator: serializeUser(findMemoryUser(plain.initiator)),
    items: (plain.items || []).map((item) => ({
      ...item,
      user: serializeUser(findMemoryUser(item.user)),
    })),
  };
};

const populateBatchQuery = (query) =>
  query
    .populate("initiator", "name email role")
    .populate("items.user", "name email role");

const getAllBatches = async () => {
  if (!isMemoryModeEnabled()) {
    const batches = await populateBatchQuery(Batch.find().sort({ createdAt: -1 }));
    return batches.map(normalizeMongoBatch);
  }

  return clone(store.batches)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .map(normalizeMemoryBatch);
};

const findBatchById = async (batchId) => {
  if (!batchId) {
    return null;
  }

  if (!isMemoryModeEnabled()) {
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return null;
    }

    const batch = await populateBatchQuery(Batch.findById(batchId));
    return normalizeMongoBatch(batch);
  }

  const batch = store.batches.find((entry) => entry._id === batchId);
  return normalizeMemoryBatch(batch);
};

const createBatch = async ({
  initiator,
  buildingId,
  restaurantName,
  expiresAt,
  items,
}) => {
  if (!isMemoryModeEnabled()) {
    const batch = await Batch.create({
      initiator,
      buildingId,
      restaurantName,
      expiresAt,
      items,
    });

    return findBatchById(batch._id.toString());
  }

  const now = timestamp();
  const batch = {
    _id: createId(),
    initiator,
    buildingId,
    restaurantName,
    expiresAt,
    status: "LIVE",
    createdAt: now,
    updatedAt: now,
    items: (items || []).map((item) => ({
      _id: createId(),
      name: item.name,
      quantity: Number(item.quantity),
      price: Number(item.price),
      user: item.user,
      createdAt: now,
      updatedAt: now,
    })),
  };

  store.batches.unshift(batch);
  return normalizeMemoryBatch(batch);
};

const addItemToBatch = async (batchId, item) => {
  if (!isMemoryModeEnabled()) {
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return null;
    }

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

  const now = timestamp();
  batch.items.push({
    _id: createId(),
    name: item.name,
    quantity: Number(item.quantity),
    price: Number(item.price),
    user: item.user,
    createdAt: now,
    updatedAt: now,
  });
  batch.updatedAt = now;

  return normalizeMemoryBatch(batch);
};

const removeItemFromBatch = async (batchId, itemId) => {
  if (!isMemoryModeEnabled()) {
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return null;
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return null;
    }

    batch.items = batch.items.filter((item) => item._id.toString() !== itemId);
    await batch.save();
    return findBatchById(batchId);
  }

  const batch = store.batches.find((entry) => entry._id === batchId);

  if (!batch) {
    return null;
  }

  batch.items = batch.items.filter((item) => item._id !== itemId);
  batch.updatedAt = timestamp();
  return normalizeMemoryBatch(batch);
};

const closeBatch = async (batchId) => {
  if (!isMemoryModeEnabled()) {
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return null;
    }

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
  return normalizeMemoryBatch(batch);
};

module.exports = {
  addItemToBatch,
  closeBatch,
  createBatch,
  findBatchById,
  getAllBatches,
  removeItemFromBatch,
};
