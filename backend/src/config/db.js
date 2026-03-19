const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI not set. Using in-memory data store.");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected");
    return true;
  } catch (err) {
    console.warn(
      `MongoDB connection failed: ${err.message}. Falling back to in-memory data store.`
    );
    return false;
  }
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.isDatabaseReady = isDatabaseReady;
