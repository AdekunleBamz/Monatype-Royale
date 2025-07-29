# Monatype Royale - Type-to-Earn Showdown

A live typing game where users race to type silly prompts. Winner triggers an on-chain transaction to claim a reward on the Monad testnet.

## 🎮 Features

- **Wallet Connection**: Connect to Monad testnet with MetaMask
- **Real-time Balance Display**: Shows wallet address and MON balance
- **Deposit System**: Players deposit 0.2 MON to participate
- **Typing Game**: Race to type silly crypto-themed prompts
- **On-chain Rewards**: Winner claims the deposited MON tokens
- **NFT for Losers**: Losers receive a "Monatype Loser NFT"

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MetaMask or compatible wallet
- Monad testnet MON tokens

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd monatype
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with:
```
VITE_MULTISYNQ_APP_ID="com.monad.mission6"
VITE_MULTISYNQ_API_KEY="your_multisynq_api_key"
MONAD_RPC_URL="https://testnet-rpc.monad.xyz"
PRIVATE_KEY="your_private_key"
VITE_REWARDS_CONTRACT_ADDRESS="deployed_contract_address"
```

4. Deploy the smart contract:
```bash
npx hardhat run scripts/deploy.cjs --network monad
```

5. Start the development server:
```bash
npm run dev
```

6. Open http://localhost:5173 in your browser

## 🎯 How to Play

1. **Connect Wallet**: Click "Connect to Wallet" and approve the connection to Monad testnet
2. **Deposit**: Click "Deposit 0.2 MON" and approve the transaction in your wallet
3. **Start Game**: Once deposited, click "Start Game" to begin typing
4. **Type Fast**: Race to type the silly prompt as quickly as possible
5. **Win Rewards**: The first player to finish gets the deposited MON tokens!

## 🏗️ Architecture

### Frontend
- **React + TypeScript**: Modern UI with type safety
- **Ethers.js**: Blockchain interaction
- **Multisynq**: Real-time multiplayer state management

### Smart Contract
- **Solidity**: ERC721 NFT contract with reward distribution
- **OpenZeppelin**: Battle-tested contract libraries
- **Monad Testnet**: Fast, parallel EVM blockchain

### Key Components
- `Lobby.tsx`: Wallet connection and deposit interface
- `Game.tsx`: Typing game with real-time feedback
- `useDeposit.ts`: Hook for deposit functionality
- `useRewards.ts`: Hook for reward distribution
- `Rewards.sol`: Smart contract for game economy

## 🔧 Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npx hardhat compile`: Compile smart contracts
- `npx hardhat test`: Run tests

### Contract Functions
- `deposit()`: Deposit 0.2 MON to participate
- `mintLoserNft(address)`: Mint NFT for losing player
- `sendWinnerReward(address, address)`: Send reward to winner
- `withdraw()`: Owner can withdraw contract balance

## 🎨 UI Features

- **Green Blinking Dot**: Visual indicator for wallet connection
- **Real-time Balance**: Shows current MON balance
- **Progress Tracking**: Timer and typing progress
- **Silly Prompts**: Crypto-themed typing challenges
- **Winner Celebration**: Animated victory screen

## 🔐 Security

- Environment variables for sensitive data
- Network validation (Monad testnet only)
- Transaction error handling
- MetaMask connection validation

## 🚀 Deployment

The app is ready for deployment on Vercel or similar platforms. The build process handles:
- TypeScript compilation
- Environment variable injection
- Static asset optimization

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built for Mission 6: Multiplayer Apps with Multisynq** 🚀
