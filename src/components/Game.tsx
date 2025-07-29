import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRewards } from '../hooks/useRewards';
import { Player } from '../model/PresenceModel';

interface GameProps {
  provider: ethers.BrowserProvider | null;
  currentPlayer: Player | null;
}

export const Game: React.FC<GameProps> = ({ provider, currentPlayer }) => {
  const [prompt, setPrompt] = useState('The quick brown fox jumps over the lazy dog.');
  const [userInput, setUserInput] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [loser, setLoser] = useState<Player | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { isMinting, isSending, error } = useRewards(provider, winner, loser);

  const sillyPrompts = [
    "My crypto dog dances better than your memecoin",
    "Left-curve liquidity lords live lavishly",
    "The blockchain never sleeps, but my cat does",
    "Smart contracts are smarter than my ex",
    "Gas fees are higher than my expectations",
    "HODLing is not just a strategy, it's a lifestyle",
    "Wen moon? Wen lambo? Wen peace?",
    "Diamond hands make diamond profits",
    "The only thing more volatile than crypto is my mood",
    "Not financial advice, but definitely life advice"
  ];

  useEffect(() => {
    if (gameStarted && !gameFinished) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 0.1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameFinished]);

  const startGame = () => {
    setPrompt(sillyPrompts[Math.floor(Math.random() * sillyPrompts.length)]);
    setGameStarted(true);
    setStartTime(Date.now());
    setElapsedTime(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!gameStarted || gameFinished) return;
    
    const value = e.target.value;
    setUserInput(value);
    
    if (value === prompt) {
      // Player finished!
      setGameFinished(true);
      if (currentPlayer) {
        setWinner(currentPlayer);
        // For demo purposes, create a mock loser
        setLoser({
          id: 'mock-loser',
          name: 'Opponent',
          joinedAt: Date.now()
        });
      }
    }
  };

  const resetGame = () => {
    setUserInput('');
    setGameStarted(false);
    setGameFinished(false);
    setWinner(null);
    setLoser(null);
    setStartTime(null);
    setElapsedTime(0);
  };

  if (!currentPlayer) {
    return <div>Please connect your wallet to play.</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Monatype Royale</h2>
      
      {!gameStarted ? (
        <div>
          <p>Ready to type your way to victory?</p>
          <button 
            onClick={startGame}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Start Game
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <p><strong>Time:</strong> {elapsedTime.toFixed(1)}s</p>
            <p><strong>Prompt:</strong></p>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '5px',
              marginBottom: '15px',
              fontSize: '18px'
            }}>
              {prompt}
            </div>
          </div>
          
          <textarea
            value={userInput}
            onChange={handleInputChange}
            placeholder="Start typing here..."
            style={{
              width: '100%',
              height: '150px',
              padding: '15px',
              fontSize: '16px',
              border: '2px solid #ddd',
              borderRadius: '5px',
              resize: 'vertical'
            }}
            disabled={gameFinished}
          />
          
          {gameFinished && winner && (
            <div style={{ 
              marginTop: '20px', 
              padding: '20px', 
              backgroundColor: '#e8f5e8', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3>🎉 Congratulations! You won! 🎉</h3>
              <p>Time: {elapsedTime.toFixed(1)}s</p>
              {isMinting && <p>Minting NFT for loser...</p>}
              {isSending && <p>Sending reward to winner...</p>}
              {error && <p style={{ color: 'red' }}>Error: {error}</p>}
              {!isMinting && !isSending && !error && (
                <p>Rewards have been distributed! Winner gets the MON tokens.</p>
              )}
              <button 
                onClick={resetGame}
                style={{
                  marginTop: '15px',
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 