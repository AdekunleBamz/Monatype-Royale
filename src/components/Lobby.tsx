import React, { useState, useEffect } from 'react';
import WalletProviderSelector from './WalletProviderSelector';
import { ethers } from 'ethers';
import { useDeposit } from '../hooks/useDeposit';
import { Game } from './Game';
import { Player } from '../model/PresenceModel';

export const Lobby: React.FC = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const { isDepositing, depositError, hasDeposited, makeDeposit, checkDeposit } = useDeposit(provider);

  useEffect(() => {
    const getWalletInfo = async () => {
      if (provider) {
        try {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setWalletAddress(address);
          const balance = await provider.getBalance(address);
          setBalance(ethers.formatEther(balance));
        } catch (error) {
          console.error("Failed to get wallet info:", error);
          setWalletAddress(null);
          setBalance(null);
        }
      }
    };
    getWalletInfo();
    checkDeposit();

    if (provider?.provider) {
      provider.provider.on('accountsChanged', getWalletInfo);
      return () => {
        provider.provider.removeListener('accountsChanged', getWalletInfo);
      };
    }
  }, [provider, checkDeposit]);

  // Set current player when wallet is connected
  useEffect(() => {
    if (walletAddress) {
      setCurrentPlayer({
        id: walletAddress,
        name: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
        joinedAt: Date.now()
      });
    } else {
      setCurrentPlayer(null);
    }
  }, [walletAddress]);

  return (
    <div className="lobby">
      <WalletProviderSelector onProviderSelected={setProvider} />
      <h1>Monatype Royale</h1>

      {provider ? (
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
              
              {!hasDeposited ? (
                <div>
                  <button 
                    onClick={makeDeposit}
                    disabled={isDepositing}
                    style={{
                      padding: '10px 20px',
                      fontSize: '16px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: isDepositing ? 'not-allowed' : 'pointer',
                      opacity: isDepositing ? 0.6 : 1
                    }}
                  >
                    {isDepositing ? 'Processing...' : 'Deposit 0.2 MON'}
                  </button>
                  {depositError && (
                    <p style={{ color: 'red', marginTop: '10px' }}>{depositError}</p>
                  )}
                </div>
              ) : (
                <div style={{ color: 'green', fontWeight: 'bold' }}>
                  ✓ Deposit completed! You can now join a game.
                </div>
              )}
            </>
          ) : (
            <p>Could not retrieve wallet information. Please ensure your wallet is connected correctly.</p>
          )}
        </div>
      ) : (
        <p>Please connect your wallet to continue.</p>
      )}

      {/* Show Game component when player has deposited */}
      {hasDeposited && currentPlayer && (
        <div style={{ marginTop: '40px' }}>
          <Game provider={provider} currentPlayer={currentPlayer} />
        </div>
      )}
    </div>
  );
};
