const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const campaignController = require('./controllers/campaignController');
const dotenv = require('dotenv');

dotenv.config();
const mongoConnection = process.env.MONGODB_URI || 'mongodb://localhost:27017/crowdFunding';

// Initialize Express
const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "X-MiniPay-Wallet"],
}));
app.use(express.json());

// Multer configuration (move to campaignController or keep here)
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, and GIF are allowed.'));
    }
  },
});

// Connect to MongoDB
mongoose.connect(mongoConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB (crowdFunding database)');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.post('/api/campaigns', upload.single('image'), campaignController.createCampaign);
app.get('/api/campaigns/:id', campaignController.getCampaign);
app.get('/api/campaigns', campaignController.getAllCampaigns);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});