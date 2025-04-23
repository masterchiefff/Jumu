const multer = require('multer');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const Campaign = require('../models/Campaign');

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `${uuidv4()}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, and GIF are allowed.'));
    }
  },
}).single('image');

// Validation schema using Zod
const campaignSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  targetAmount: z.number().positive('Target amount must be positive'),
  location: z.string().min(2, 'Location must be at least 2 characters long'),
  category: z.enum(['education', 'housing', 'water', 'healthcare', 'infrastructure']),
  creator: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

// Mock image upload (replace with IPFS/S3 in production)
const uploadImage = async (file) => {
  // For local testing, return a file path
  return `/uploads/${file.filename}`; // Adjust for production (e.g., S3 URL)
};

exports.createCampaign = (req, res) => {
  // Handle Multer upload
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { title, description, targetAmount, location, category, creator } = req.body;
      const walletAddress = req.headers['x-minipay-wallet'];

      // Log incoming data
      console.log('Creating campaign with data:', {
        title,
        description,
        targetAmount,
        location,
        category,
        creator,
        walletAddress,
        hasFile: !!req.file,
      });

      // Validate input with Zod
      const parsed = campaignSchema.safeParse({
        title,
        description,
        targetAmount: parseFloat(targetAmount),
        location,
        category,
        creator,
      });
      if (!parsed.success) {
        console.log('Zod validation errors:', parsed.error.errors);
        return res.status(400).json({ error: parsed.error.errors });
      }

      // Validate wallet
      if (!walletAddress || walletAddress.toLowerCase() !== creator.toLowerCase()) {
        console.log('Wallet validation failed:', { walletAddress, creator });
        return res.status(401).json({ error: 'Unauthorized wallet address' });
      }

      // Handle image upload
      let imageUrl = '';
      if (req.file) {
        try {
          imageUrl = await uploadImage(req.file);
          console.log('Image uploaded:', imageUrl);
        } catch (uploadErr) {
          console.error('Image upload error:', uploadErr.message);
          return res.status(400).json({ error: 'Failed to upload image' });
        }
      }

      // Create campaign in MongoDB
      const campaign = new Campaign({
        campaignId: uuidv4(),
        title,
        description,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        imageUrl,
        creator,
        location,
        category,
        createdAt: new Date(),
        contributions: [],
        updates: [],
      });

      await campaign.save();
      console.log('Campaign saved to MongoDB:', campaign.campaignId);

      res.status(201).json({
        id: campaign.campaignId,
        title: campaign.title,
        description: campaign.description,
        targetAmount: campaign.targetAmount,
        location: campaign.location,
        category: campaign.category,
        imageUrl: campaign.imageUrl,
        creator: campaign.creator,
        createdAt: campaign.createdAt,
      });
    } catch (error) {
      console.error('Error creating campaign:', {
        message: error.message,
        stack: error.stack,
        body: req.body,
        headers: req.headers,
        file: req.file,
      });
      res.status(500).json({ error: error.message || 'Failed to create campaign' });
    }
  });
};

// Optional: GET endpoints for testing
exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ campaignId: req.params.id });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({
      id: campaign.campaignId,
      title: campaign.title,
      description: campaign.description,
      targetAmount: campaign.targetAmount,
      currentAmount: campaign.currentAmount || 0,
      imageUrl: campaign.imageUrl,
      creator: campaign.creator,
      location: campaign.location,
      category: campaign.category,
      createdAt: campaign.createdAt,
      contributions: campaign.contributions || [],
      updates: campaign.updates || [],
    });
  } catch (error) {
    console.error('Error fetching campaign:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    if (!campaigns || campaigns.length === 0) {
      return res.status(200).json([]);
    }

    const response = campaigns.map(campaign => ({
      id: campaign.campaignId,
      title: campaign.title,
      description: campaign.description,
      targetAmount: campaign.targetAmount,
      currentAmount: campaign.currentAmount || 0,
      imageUrl: campaign.imageUrl,
      creator: campaign.creator,
      location: campaign.location,
      category: campaign.category,
      createdAt: campaign.createdAt,
      contributions: campaign.contributions || [],
      updates: campaign.updates || [],
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching campaigns:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};