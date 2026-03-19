const User = require("../models/User");
const { isDatabaseReady } = require("../config/db");
const { createId, store, timestamp, toPlainObject } = require("../data/memoryStore");

const findUserByEmail = async (email) => {
  if (isDatabaseReady()) {
    return User.findOne({ email });
  }

  const user = store.users.find((entry) => entry.email === email);
  return user ? toPlainObject(user) : null;
};

const createUser = async ({ name, email, password, role = "student" }) => {
  if (isDatabaseReady()) {
    return User.create({ name, email, password, role });
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

  return toPlainObject(user);
};

module.exports = {
  createUser,
  findUserByEmail,
};
