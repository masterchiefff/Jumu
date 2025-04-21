# Jumu 
Jumu (pronounced "JOO-moo") is a simple way for communities to fund local projects—like water pumps or small shops—using your phone. Built with MiniPay and the Celo blockchain, it hides the techy stuff so anyone can join in. Pay with M-Pesa, get SMS updates, and see your community grow together. This repo has two parts: a Next.js frontend (`client`) and a Node.js backend (`server`) with Africa’s Talking support. 
## Projects 
- `client`: Next.js app for creating projects and sending money, all phone-friendly. 
- `server`: Node.js app handling payments and SMS, keeping things smooth. 
## Features 
- **Easy Giving**: Send money with M-Pesa—no complicated setup. 
- **SMS Alerts**: Get texts like “Your 100 KSH helped the water project!” 
- **No Tech Needed**: Blockchain works quietly; you just use your phone. 
- **Togetherness**: Support ideas from your neighbors. 
## Prerequisites 
- Node.js (v16 or higher) 
- npm or yarn 
- Africa’s Talking account ([sign up here](https://africastalking.com)) 
- A phone with M-Pesa or MiniPay (for testing) 
- Celo Alfajores Testnet (for devs) 
## Repository Structure 
``` jumu/ 
├── client/ # Next.js frontend
├── server/ # Node.js backend 
├── contracts/ # Smart contracts (shared) 
├── README.md 
└── package.json # Root config for monorepo 
``` 

## Installation 
1. **Get the Code** ```bash git clone https://github.com/yourusername/jumu.git cd jumu ``` 
2. **Set Up Basics** ```bash npm install ``` 
### Client Setup (Next.js) 
3. **Go to Client** ```bash cd client npm install ``` 
4. **Add Settings** Create `client/.env.local`: ``` NEXT_PUBLIC_SERVER_URL=http://localhost:5000 NEXT_PUBLIC_CELO_RPC_URL=https://alfajores-forno.celo-testnet.org ``` ### Server Setup (Node.js) 
5. **Go to Server** ```bash cd server npm install ``` 
6. **Add Settings** Create `server/.env`: ``` PORT=5000 AFRICASTALKING_API_KEY=your_api_key AFRICASTALKING_USERNAME=your_username PRIVATE_KEY=your_celo_private_key CELO_RPC_URL=https://alfajores-forno.celo-testnet.org ``` Grab your Africa’s Talking API key from their site.
## Usage ### Start the Server 
1. **Run Server** ```bash cd server npm run dev ``` - Takes care of payments, SMS, and blockchain bits. 
### Start the Client 
2. **Run Client** ```bash cd client npm run dev ``` - Visit `http://localhost:3000`. Test on mobile with: ```bash ngrok http 3000 ``` 
3. **Try It Out (Test Mode)** - Get test cUSD from the Alfajores Faucet. - Set up contracts: ```bash npx hardhat run contracts/scripts/deploy.js --network alfajores ``` 
4. **Use It** 
- **Add a Project**: Type your idea and goal (e.g., 500 KSH) on the site. 
- **Give Money**: Pay with M-Pesa (via SMS) or MiniPay if you have it. 
- **Stay Updated**: Check SMS for news on your project. 

## How It Feels (For Users) 
- Sign up with your phone number—no wallets or tech terms. 
- Pay with M-Pesa, get a text back, and watch your community shine. 
- The blockchain keeps things safe, but you don’t need to know it.
## Development 
- **Build Contracts**: `npx hardhat compile` (from root) 
- **Test Contracts**: `npx hardhat test` (from root) 
- **Server APIs**: Look at `server/routes/` (e.g., `/api/donate`, `/api/sms`). 
- **Client Pages**: Check `client/pages/` for Next.js screens. ## Contributing Fork it, send a PR, or chat with us on [Discord/Twitter] (links coming soon). 
## License MIT License 
- See LICENSE for details. 
## Thanks To 
- MiniPay, Celo, and Africa’s Talking for the tools. 
- Made for communities, by people like you. --- **Jumu: Grow Together, Step by Step.**