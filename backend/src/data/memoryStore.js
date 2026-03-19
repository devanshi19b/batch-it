const mongoose = require("mongoose");

const store = {
  users: [],
  batches: [],
};

const toPlainObject = (value) => JSON.parse(JSON.stringify(value));

const createId = () => new mongoose.Types.ObjectId().toString();

const timestamp = () => new Date().toISOString();

const sortByCreatedAtDesc = (records) =>
  [...records].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

const resetMemoryStore = () => {
  store.users.length = 0;
  store.batches.length = 0;
};

module.exports = {
  store,
  createId,
  resetMemoryStore,
  sortByCreatedAtDesc,
  timestamp,
  toPlainObject,
};
