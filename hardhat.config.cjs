require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");

// Load env file
dotenv.config();

// Verify environment variables
if (!process.env.PRIVATE_KEY || !process.env.MONAD_RPC_URL) {
  console.error("Please set your PRIVATE_KEY and MONAD_RPC_URL in a .env file");
  process.exit(1);
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.20", settings: { optimizer: { enabled: true, runs: 200 } } },
      { version: "0.8.28", settings: { optimizer: { enabled: true, runs: 200 } } }
    ]
  },
  networks: {
    monad: {
      url: process.env.MONAD_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 10143,
    },
  },
};