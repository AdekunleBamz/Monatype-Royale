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

  const handleProviderSelect = (provider: any) => {
    const web3Provider = new ethers.BrowserProvider(provider);
    setSelectedProvider(provider);
    onProviderSelected(web3Provider);
  };

  if (selectedProvider) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
        <span style={{
          display: 'inline-block',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: '#00ff00',
          boxShadow: '0 0 8px 2px #00ff00',
          animation: 'blinker 1s linear infinite'
        }} />
        <span>Connected to Monad Testnet</span>
        <style>{`
          @keyframes blinker {
            50% { opacity: 0.2; }
          }
        `}</style>
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
