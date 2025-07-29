import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletProviderSelector: React.FC<{ onProviderSelected: (provider: ethers.BrowserProvider) => void }> = ({ onProviderSelected }) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);

  useEffect(() => {
    const detectProviders = () => {
      const detectedProviders = window.ethereum?.providers || (window.ethereum ? [window.ethereum] : []);
      setProviders(detectedProviders);
    };

    detectProviders();
    window.ethereum?.on('providersChanged', detectProviders);

    return () => {
      window.ethereum?.removeListener('providersChanged', detectProviders);
    };
  }, []);

  const handleProviderSelect = async (provider: any) => {
    const web3Provider = new ethers.BrowserProvider(provider);
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x279F' }], // 10143 in hex
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x279F',
                chainName: 'Monad Testnet',
                rpcUrls: ['https://testnet.monad.xyz'],
                nativeCurrency: {
                  name: 'MON',
                  symbol: 'MON',
                  decimals: 18,
                },
                blockExplorerUrls: [''],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add the network:', addError);
          return;
        }
      } else {
        console.error('Failed to switch the network:', switchError);
        return;
      }
    }
    setSelectedProvider(provider);
    onProviderSelected(web3Provider);
  };

  if (selectedProvider) {
    return null;
  }

  return (
    <div>
      <h2>Select a Wallet</h2>
      {providers.length > 0 ? (
        <ul>
          {providers.map((provider, index) => (
            <li key={index}>
              <button onClick={() => handleProviderSelect(provider)}>
                Connect to Wallet
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No Ethereum wallet detected. Please install MetaMask or another wallet.</p>
      )}
    </div>
  );
};

export default WalletProviderSelector;
