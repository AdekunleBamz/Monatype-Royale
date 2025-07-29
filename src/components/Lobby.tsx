import React, { useState, useEffect } from 'react';
import WalletProviderSelector from './WalletProviderSelector';
import { ethers } from 'ethers';
import { GameRoom } from './GameRoom';

export const Lobby: React.FC = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const getWalletInfo = async () => {
      if (provider) {
        try {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setWalletAddress(address);
          const balance = await provider.getBalance(address);
          setBalance(ethers.formatEther(balance));
          setIsConnected(true);
        } catch (error) {
          console.error("Failed to get wallet info:", error);
          setWalletAddress(null);
          setBalance(null);
          setIsConnected(false);
        }
      } else {
        setWalletAddress(null);
        setBalance(null);
        setIsConnected(false);
      }
    };
    getWalletInfo();

    if (provider?.provider) {
      provider.provider.on('accountsChanged', getWalletInfo);
      return () => {
        provider.provider.removeListener('accountsChanged', getWalletInfo);
      };
    }
  }, [provider]);

  return (
    <div className="lobby">
      <WalletProviderSelector onProviderSelected={setProvider} />
      <h1>Monatype Royale</h1>

      {provider && isConnected ? (
        <div className="wallet-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '1rem' }}>
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
          {walletAddress ? (
            <>
              <p><strong>Address:</strong> {walletAddress}</p>
              <p><strong>Balance:</strong> {balance} MON</p>
            </>
          ) : (
            <p>Could not retrieve wallet information. Please ensure your wallet is connected correctly.</p>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '8px', 
            padding: '15px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '0', color: '#856404' }}>
              <strong>Wallet Not Connected</strong>
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#856404' }}>
              Please make sure your Monad wallet is connected to continue.
            </p>
          </div>
        </div>
      )}

      {/* Show GameRoom when wallet is connected */}
      {provider && walletAddress && (
        <div style={{ marginTop: '40px' }}>
          <GameRoom provider={provider} walletAddress={walletAddress} />
        </div>
      )}
    </div>
  );
};
