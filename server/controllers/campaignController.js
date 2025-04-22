const multer = require('multer');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const { newKit } = require('@celo/contractkit');
const Campaign = require('../models/Campaign');

// Configure multer for image uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, and GIF are allowed.'));
    }
  },
});

// Validation schema using Zod
const campaignSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  targetAmount: z.number().positive('Target amount must be positive'),
  location: z.string().min(2, 'Location must be at least 2 characters long'),
  category: z.enum(['education', 'housing', 'water', 'healthcare', 'infrastructure']),
});

// Initialize Celo ContractKit
const initializeCeloKit = async () => {
  const kit = newKit('https://alfajores-forno.celo-testnet.org');
  // Add your funded account's private key (securely in production)
  kit.addAccount('YOUR_PRIVATE_KEY');
  return kit;
};

// Contract ABI (from compilation)
const contractABI = [
  // Add ABI from compiled CampaignFactory.sol
  // Example: [{"inputs":[{"internalType":"string","name":"_id","type":"string"},...],"name":"createCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},...]
];

// Contract address (from deployment)
const contractAddress = '0xYourContractAddress';

// Get MiniPay wallet address
const getWalletAddress = (req) => {
  return req.headers['x-minipay-wallet'] || null;
};

// Mock image upload (replace with IPFS/S3 in production)
const uploadImage = async (file) => {
  return `https://example.com/uploads/${file.filename}`;
};

exports.createCampaign = [
  upload.single('image'),
  async (req, res) => {
    try {
      // Validate input
      const campaignData = campaignSchema.parse({
        title: req.body.title,
        description: req.body.description,
        targetAmount: parseFloat(req.body.targetAmount),
        location: req.body.location,
        category: req.body.category,
      });

      // Check MiniPay wallet
      const walletAddress = getWalletAddress(req);
      if (!walletAddress) {
        return res.status(401).json({ error: 'MiniPay wallet not connected' });
      }

      // Handle image upload
      let imageUrl = '';
      if (req.file) {
        imageUrl = await uploadImage(req.file);
      }

      // Initialize Celo ContractKit
      const kit = await initializeCeloKit();
      const contract = new kit.web3.eth.Contract(contractABI, contractAddress);

      // Create campaign on Alfajores
      const campaignId = uuidv4();
      const tx = await contract.methods
        .createCampaign(
          campaignId,
          campaignData.title,
          campaignData.description,
          Math.floor(campaignData.targetAmount * 1e18), // Convert to wei
          campaignData.location,
          campaignData.category,
          imageUrl
        )
        .send({ from: walletAddress });

      console.log('Campaign created on Alfajores:', tx);

      // Save to MongoDB
      const campaign = new Campaign({
        campaignId,
        ...campaignData,
        imageUrl,
        creator: walletAddress,
      });
      await campaign.save();

      // Return success response
      res.status(201).json({
        id: campaignId,
        ...campaignData,
        imageUrl,
        creator: walletAddress,
        createdAt: campaign.createdAt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating campaign:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
];

exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ campaignId: req.params.id });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
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
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};