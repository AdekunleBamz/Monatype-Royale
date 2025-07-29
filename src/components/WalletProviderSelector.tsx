import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletProviderSelector: React.FC<{ onProviderSelected: (provider: ethers.BrowserProvider | null) => void }> = ({ onProviderSelected }) => {
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
    try {
      // First request account access - this triggers the MetaMask popup
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });
      
      console.log('Accounts requested:', accounts);
      
      // Then try to switch to Monad testnet
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x279F' }], // 10143 in hex
        });
        console.log('Successfully switched to Monad testnet');
      } catch (switchError: any) {
        console.log('Switch error:', switchError);
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x279F',
                  chainName: 'Monad Testnet',
                  rpcUrls: ['https://testnet-rpc.monad.xyz'],
                  nativeCurrency: {
                    name: 'MON',
                    symbol: 'MON',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://explorer.testnet.monad.xyz'],
                },
              ],
            });
            console.log('Successfully added Monad testnet');
          } catch (addError) {
            console.error('Failed to add the network:', addError);
            return;
          }
        } else {
          console.error('Failed to switch the network:', switchError);
          return;
        }
      }
      
      // Create provider with ENS disabled for Monad testnet
      const web3Provider = new ethers.BrowserProvider(provider, {
        name: 'Monad Testnet',
        chainId: 10143,
        ensAddress: undefined // Disable ENS
      });
      
      console.log('Provider created successfully');
      setSelectedProvider(provider);
      onProviderSelected(web3Provider);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnect = () => {
    setSelectedProvider(null);
    onProviderSelected(null);
  };

  if (selectedProvider) {
    return (
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={handleDisconnect}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Disconnect Wallet
        </button>
      </div>
    );
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
