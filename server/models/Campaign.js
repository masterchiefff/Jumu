const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  campaignId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
  creator: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  contributions: [{ type: Object }],
  updates: [{ type: Object }],
});

module.exports = mongoose.model('Campaign', campaignSchema);