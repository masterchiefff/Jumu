const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  campaignId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  imageUrl: { type: String },
  creator: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  contributions: [
    {
      contributor: { type: String, required: true },
      amount: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  updates: [
    {
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Campaign", campaignSchema, "campaigns");