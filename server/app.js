const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const campaignController = require('./controllers/campaignController');
const dotenv = require('dotenv');

dotenv.config();
const mongoConnection = process.env.MONGODB_URI || 'mongodb://localhost:27017/crowdFunding'; // MongoDB URI

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(mongoConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB (crowdFunding database)');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Routes
app.post('/api/campaigns', campaignController.createCampaign);
app.get("/api/campaigns/:id", campaignController.getCampaign);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});