const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");

let memoryMode = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    memoryMode = false;
    return { mode: "mongo", connected: true };
  }

  if (!MONGO_URI) {
    memoryMode = true;
    console.warn("MONGO_URI is not configured. Starting in memory mode.");
    return { mode: "memory", connected: false };
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    memoryMode = false;
    console.log("MongoDB connected");
    return { mode: "mongo", connected: true };
  } catch (error) {
    memoryMode = true;
    console.warn(
      `MongoDB connection failed: ${error.message}. Starting in memory mode.`
    );
    return { mode: "memory", connected: false };
  }
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const isMemoryModeEnabled = () => memoryMode || !isDatabaseReady();

module.exports = {
  connectDB,
  isDatabaseReady,
  isMemoryModeEnabled,
};
