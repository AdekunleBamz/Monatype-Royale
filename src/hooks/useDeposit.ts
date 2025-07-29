import { useState } from 'react';
import { ethers } from 'ethers';

const rewardsContractAbi = [
  "function deposit() payable",
  "function deposits(address) view returns (uint256)"
];

const rewardsContractAddress = import.meta.env.VITE_REWARDS_CONTRACT_ADDRESS;
console.log("VITE_REWARDS_CONTRACT_ADDRESS:", import.meta.env.VITE_REWARDS_CONTRACT_ADDRESS);
console.log("All env:", import.meta.env);
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
      const signer = await provider.getSigner();
      const rewardsContract = new ethers.Contract(rewardsContractAddress, rewardsContractAbi, signer);
      const depositAmount = await rewardsContract.deposits(await signer.getAddress());
      if (depositAmount >= ethers.parseEther("0.2")) {
        setHasDeposited(true);
      }
    } catch (err: any) {
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
      const signer = await provider.getSigner();
      const rewardsContract = new ethers.Contract(rewardsContractAddress, rewardsContractAbi, signer);
      const tx = await rewardsContract.deposit({ value: ethers.parseEther("0.2") });
      await tx.wait();
      setHasDeposited(true);
    } catch (err: any) {
      console.error("Failed to make deposit:", err);
      setDepositError(err.reason || "Failed to make deposit.");
    } finally {
      setIsDepositing(false);
    }
  };

  return { isDepositing, depositError, hasDeposited, makeDeposit, checkDeposit };
};
