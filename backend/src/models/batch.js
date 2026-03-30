const mongoose = require("mongoose");
const itemSchema = require("./Item");

const batchSchema = new mongoose.Schema(
  {
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buildingId: {
      type: String,
      required: true,
      trim: true,
    },
    restaurantName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["LIVE", "CLOSED"],
      default: "LIVE",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    items: [itemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Batch || mongoose.model("Batch", batchSchema);
