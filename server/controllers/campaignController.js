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
  kit.addAccount(process.env.PRIVATE_KEY);
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

exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find(); // Fetch all campaigns from MongoDB
    if (!campaigns || campaigns.length === 0) {
      return res.status(200).json([]); // Return empty array if no campaigns exist
    }

    // Map campaigns to the desired response format
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

exports.createCampaign = async (req, res, next) => {
  try {
    const { title, description, targetAmount, location, category, creator } = req.body;
    const walletAddress = req.headers["x-minipay-wallet"];
    const web3 = req.app.get("web3");
    const privateKey = process.env.PRIVATE_KEY;

    // Log incoming data
    console.log("Creating campaign with data:", {
      title,
      description,
      targetAmount,
      location,
      category,
      creator,
      walletAddress,
      hasFile: !!req.file,
    });

    // Validate wallet
    if (!walletAddress || walletAddress.toLowerCase() !== creator.toLowerCase()) {
      return res.status(401).json({ error: "Unauthorized wallet address" });
    }

    // Validate required fields
    const errors = [];
    if (!title) errors.push({ message: "Title is required", path: ["title"] });
    if (!description) errors.push({ message: "Description is required", path: ["description"] });
    if (!targetAmount || isNaN(targetAmount) || parseFloat(targetAmount) <= 0) {
      errors.push({ message: "Valid target amount is required", path: ["targetAmount"] });
    }
    if (!location) errors.push({ message: "Location is required", path: ["location"] });
    if (!category) errors.push({ message: "Category is required", path: ["category"] });
    if (!creator) errors.push({ message: "Creator is required", path: ["creator"] });

    if (errors.length > 0) {
      return res.status(400).json({ error: errors });
    }

    // Validate private key
    if (!privateKey || !web3.utils.isHexStrict(privateKey) || privateKey.length !== 66) {
      console.error("Invalid private key:", { privateKey: privateKey ? "Provided but invalid" : "Missing" });
      throw new Error("Invalid private key: Must be 32 bytes (64 hex characters with 0x prefix)");
    }

    // Add private key to Web3 account
    let account;
    try {
      account = web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(account);
    } catch (err) {
      console.error("Private key error:", err.message);
      throw new Error("Failed to initialize account with private key");
    }

    // Check account balance
    const balance = await web3.eth.getBalance(account.address);
    if (web3.utils.toWei("0.01", "ether") > balance) {
      console.error("Insufficient balance:", { address: account.address, balance: web3.utils.fromWei(balance, "ether") });
      throw new Error("Insufficient funds in server wallet for transaction");
    }

    // Handle image upload
    let imageUrl = "";
    if (req.file) {
      try {
        imageUrl = await uploadImage(req.file);
      } catch (uploadErr) {
        console.error("Image upload error:", uploadErr);
        return res.status(400).json({ error: "Failed to upload image" });
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
    console.log("Campaign saved to MongoDB:", campaign.campaignId);

    // Mock Celo transaction (replace with actual contract interaction)
    try {
      const tx = {
        from: account.address,
        to: creator,
        value: web3.utils.toWei("0.001", "ether"),
        gas: 21000,
        gasPrice: await web3.eth.getGasPrice(),
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log("Celo transaction successful:", txReceipt.transactionHash);
    } catch (txError) {
      console.error("Celo transaction error:", txError.message, txError.stack);
      throw new Error("Failed to record campaign on Celo blockchain");
    }

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
    console.error("Error creating campaign:", error.message, error.stack);
    next(error);
  }
};

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