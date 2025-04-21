const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const AfricasTalking = require('africastalking');
const Web3 = require('web3');

dotenv.config({ path: '.env' });

const app = express();

const PORT = process.env.PORT || 5000;
const AFRICASTALKING_API_KEY = process.env.AFRICASTALKING_API_KEY;
const AFRICASTALKING_USERNAME = process.env.AFRICASTALKING_USERNAME;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CELO_RPC_URL = process.env.CELO_RPC_URL;

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const africasTalking = AfricasTalking({
    apiKey: AFRICASTALKING_API_KEY,
    username: AFRICASTALKING_USERNAME,
}); 

// const web3 = new Web3(CELO_RPC_URL);
// const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
// web3.eth.accounts.wallet.add(account);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});