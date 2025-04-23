const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const campaignController = require('./controllers/campaignController');
const path = require('path');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies (for other routes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/campaigns', campaignController.createCampaign);
app.get('/api/campaigns', campaignController.getAllCampaigns);
app.get('/api/campaigns/:id', campaignController.getCampaign);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});