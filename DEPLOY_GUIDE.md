# Guide to Deploying Smart Contracts on Monad Testnet

This guide will walk you through the process of setting up a Hardhat development environment, compiling your smart contract, and deploying it to the Monad testnet.

## Prerequisites

Before you begin, make sure you have the following installed:

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [npm](https://www.npmjs.com/) (comes with Node.js)
*   A wallet with Monad testnet funds. You can get some from a Monad faucet.
*   Your wallet's private key. **NEVER share your private key or commit it to a public repository.**

## Step 1: Set Up Your Hardhat Project

First, you need to set up a Hardhat project. If you haven't already, open your terminal and run the following commands:

```bash
# 1. Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# 2. Initialize a new Hardhat project
npx hardhat
```

When prompted, choose `Create a JavaScript project` and follow the on-screen instructions. This will create a new Hardhat project with a sample contract, scripts, and configuration file.

## Step 2: Install OpenZeppelin Contracts

Your `Rewards.sol` contract imports contracts from OpenZeppelin. You need to install them:

```bash
npm install @openzeppelin/contracts
```

## Step 3: Configure Hardhat for Monad

You need to configure Hardhat to connect to the Monad testnet.

1.  **Create a `.env` file** in the root of your project to store your private key and the Monad RPC URL securely.

    ```
    MONAD_RPC_URL="https://testnet.monad.xyz"
    PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY"
    ```
    **Important:** Add `.env` to your `.gitignore` file to prevent accidentally committing your private key.

2.  **Install `dotenv`** to load the environment variables from your `.env` file.
    ```bash
    npm install dotenv
    ```

3.  **Update your `hardhat.config.ts`** file to include the Monad testnet configuration:

    ```javascript
    require("@nomicfoundation/hardhat-toolbox");
    require("dotenv").config();

    /** @type import('hardhat/config').HardhatUserConfig */
    module.exports = {
      solidity: "0.8.20",
      networks: {
        monad: {
          url: process.env.MONAD_RPC_URL || "",
          accounts:
            process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
        },
      },
    };
    ```

## Step 4: Add Your Contract

Place your `Rewards.sol` file into the `contracts/` directory of your Hardhat project.

## Step 5: Compile the Contract

Now, compile your smart contract using Hardhat:

```bash
npx hardhat compile
```

This will generate the ABI and bytecode for your contract and save them in the `artifacts/` directory.

## Step 6: Create a Deployment Script

Create a new deployment script in the `scripts/` directory. You can name it `deploy.js`.

```javascript
const { ethers } = require("hardhat");

async function main() {
  const rewardsContract = await ethers.deployContract("MonatypeRewards");

  await rewardsContract.waitForDeployment();

  console.log(
    `Rewards contract deployed to ${rewardsContract.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

**Note:** You will need to find an existing ERC20 token on the Monad testnet to use as the `rewardTokenAddress`, or deploy your own.

## Step 7: Deploy to Monad Testnet

Finally, run the deployment script to deploy your contract to the Monad testnet:

```bash
npx hardhat run scripts/deploy.js --network monad
```

If successful, you will see the address of your deployed contract in the terminal.

## Step 8: Update Your Frontend

Once you have the deployed contract address, update the `rewardsContractAddress` constant in your `src/hooks/useRewards.ts` file with the new address. You will also need to copy the ABI from `artifacts/contracts/Rewards.sol/MonatypeRewards.json` and update the `rewardsContractAbi` constant.

Your game should now be fully functional and connected to your smart contract on the Monad testnet.
