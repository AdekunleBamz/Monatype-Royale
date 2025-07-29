import { useState } from 'react';
import { ethers } from 'ethers';
import rewardsAbiJson from '../abi/MonatypeRewards.json';

const rewardsContractAbi = rewardsAbiJson.abi;
const MONAD_CHAIN_ID = 10143n;
const rewardsContractAddress = import.meta.env.VITE_REWARDS_CONTRACT_ADDRESS;

if (!rewardsContractAddress) {
  throw new Error("VITE_REWARDS_CONTRACT_ADDRESS is not set. Check your .env and restart the dev server.");
}

export const useDeposit = (provider: ethers.BrowserProvider | null) => {
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [hasDeposited, setHasDeposited] = useState(false);

  const checkDeposit = async () => {
    if (!provider) return;
    try {
      const network = await provider.getNetwork();
      if (network.chainId !== MONAD_CHAIN_ID) {
        setDepositError('Please connect your wallet to Monad testnet (chainId 10143).');
        return;
      }
      const signer = await provider.getSigner();
      const rewardsContract = new ethers.Contract(rewardsContractAddress, rewardsContractAbi, signer);
      const depositAmount = await rewardsContract.deposits(await signer.getAddress());
      
      // @ts-ignore - Ignoring bigint comparison issue
      if (BigInt(depositAmount) >= ethers.parseEther("0.2")) {
        setHasDeposited(true);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Block tracker destroyed')) {
        setDepositError('MetaMask connection error. Please refresh the page and reconnect your wallet.');
      } else {
        setDepositError(err.reason || err.message || 'Failed to check deposit.');
      }
      console.error("Failed to check deposit:", err);
    }
  };

  const makeDeposit = async () => {
    if (!provider) {
      setDepositError("Please connect your wallet first.");
      return;
    }

    setIsDepositing(true);
    setDepositError(null);

    try {
      const network = await provider.getNetwork();
      if (network.chainId !== MONAD_CHAIN_ID) {
        setDepositError('Please connect your wallet to Monad testnet (chainId 10143).');
        setIsDepositing(false);
        return;
      }
      
      const signer = await provider.getSigner();
      const rewardsContract = new ethers.Contract(rewardsContractAddress, rewardsContractAbi, signer);
      
      // This will trigger wallet approval prompt
      const tx = await rewardsContract.deposit({ 
        value: ethers.parseEther("0.2"),
        gasLimit: 200000 // Explicit gas limit
      });
      
      console.log("Deposit transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("Deposit confirmed:", receipt);
      
      setHasDeposited(true);
      setDepositError(null);
    } catch (err: any) {
      console.error("Deposit error details:", err);
      
      if (err.code === 4001) {
        setDepositError('Transaction was rejected by user.');
      } else if (err.message && err.message.includes('Block tracker destroyed')) {
        setDepositError('MetaMask connection error. Please refresh the page and reconnect your wallet.');
      } else if (err.reason) {
        setDepositError(`Transaction failed: ${err.reason}`);
      } else {
        setDepositError(err.message || 'Failed to make deposit. Please try again.');
      }
    } finally {
      setIsDepositing(false);
    }
  };

  return { isDepositing, depositError, hasDeposited, makeDeposit, checkDeposit };
};