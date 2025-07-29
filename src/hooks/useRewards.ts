import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import rewardsAbiJson from '../abi/MonatypeRewards.json';
import { Player } from '../model/PresenceModel';

const rewardsContractAbi = rewardsAbiJson.abi;
const MONAD_CHAIN_ID = 10143n;
const rewardsContractAddress = import.meta.env.VITE_REWARDS_CONTRACT_ADDRESS;

if (!rewardsContractAddress) {
  throw new Error("VITE_REWARDS_CONTRACT_ADDRESS is not set. Check your .env and restart the dev server.");
}

export const useRewards = (provider: ethers.BrowserProvider | null, winner: Player | null, loser: Player | null) => {
  const [isMinting, setIsMinting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider || !winner || !loser) {
      return;
    }
    const sendRewards = async () => {
      try {
        const network = await provider.getNetwork();
        if (network.chainId !== MONAD_CHAIN_ID) {
          setError('Please connect your wallet to Monad testnet (chainId 10143).');
          return;
        }
        const signer = await provider.getSigner();
        const rewardsContract = new ethers.Contract(rewardsContractAddress, rewardsContractAbi, signer);
        setIsMinting(true);
        const mintTx = await rewardsContract.mintLoserNft(loser.id);
        await mintTx.wait();
        setIsMinting(false);
        setIsSending(true);
        const sendTx = await rewardsContract.sendWinnerReward(winner.id, loser.id);
        await sendTx.wait();
        setIsSending(false);
      } catch (err: any) {
        if (err.message && err.message.includes('Block tracker destroyed')) {
          setError('MetaMask connection error. Please refresh the page and reconnect your wallet.');
        } else {
          setError(err.reason || err.message || 'Failed to send rewards.');
        }
        console.error("Failed to send rewards:", err);
      }
    };
    sendRewards();
  }, [provider, winner, loser]);

  return { isMinting, isSending, error };
};
