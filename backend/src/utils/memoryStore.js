const mongoose = require("mongoose");

const store = {
  users: [],
  batches: [],
};

const createId = () => new mongoose.Types.ObjectId().toString();

const timestamp = () => new Date().toISOString();

const clone = (value) => JSON.parse(JSON.stringify(value));

const resetStore = () => {
  store.users = [];
  store.batches = [];
};

module.exports = {
  clone,
  createId,
  resetStore,
  store,
  timestamp,
};
