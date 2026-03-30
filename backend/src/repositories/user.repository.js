const mongoose = require("mongoose");
const User = require("../models/User");
const { isMemoryModeEnabled } = require("../config/db");
const { clone, createId, store, timestamp } = require("../utils/memoryStore");

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  const normalized = typeof user.toObject === "function" ? user.toObject() : clone(user);

  return {
    ...normalized,
    _id: normalized._id?.toString?.() || normalized._id,
  };
};

const findUserByEmail = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!isMemoryModeEnabled()) {
    const user = await User.findOne({ email: normalizedEmail });
    return normalizeUser(user);
  }

  const user = store.users.find((entry) => entry.email === normalizedEmail);
  return user ? clone(user) : null;
};

const findUserById = async (userId) => {
  if (!userId) {
    return null;
  }

  if (!isMemoryModeEnabled()) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const user = await User.findById(userId);
    return normalizeUser(user);
  }

  const user = store.users.find((entry) => entry._id === userId);
  return user ? clone(user) : null;
};

const createUser = async ({ name, email, password, role = "member" }) => {
  if (!isMemoryModeEnabled()) {
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    return normalizeUser(user);
  }

  const now = timestamp();
  const user = {
    _id: createId(),
    name,
    email,
    password,
    role,
    createdAt: now,
    updatedAt: now,
  };

  store.users.push(user);
  return clone(user);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};
