const mongoose = require("mongoose");

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
    },
    restaurantName: {
      type: String,
      required: true,
    },
    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    status: {
      type: String,
      enum: ["LIVE", "CLOSED"],
      default: "LIVE",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Batch", batchSchema);

