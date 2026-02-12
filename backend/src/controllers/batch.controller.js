const Batch = require("../models/Batch");
const mongoose = require("mongoose");

// Create Batch
exports.createBatch = async (req, res) => {
  try {
    const batch = await Batch.create({
      name: req.body.name,
      description: req.body.description,
      initiator: new mongoose.Types.ObjectId("698c429e7301db87389f309f")
    });

    res.status(201).json({
      success: true,
      data: batch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Batches
exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.find().populate("initiator");

    res.status(200).json({
      success: true,
      data: batches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




