import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRewards } from '../hooks/useRewards';
import { Player } from '../model/PresenceModel';

interface GameProps {
  provider: ethers.BrowserProvider | null;
  currentPlayer: Player | null;
  players: Player[];
  onGameFinish: (winner: Player, loser: Player) => void;
  onReset: () => void;
}

export const Game: React.FC<GameProps> = ({ provider, currentPlayer, players, onGameFinish, onReset }) => {
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
        // Find a random opponent as loser
        const opponents = players.filter(p => p.id !== currentPlayer.id);
        const randomLoser = opponents[Math.floor(Math.random() * opponents.length)] || {
          id: 'mock-loser',
          name: 'Opponent',
          joinedAt: Date.now()
        };
        setLoser(randomLoser);
        onGameFinish(currentPlayer, randomLoser);
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
    onReset();
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
                          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4a90e2 100%)',
                          padding: '20px',
                          borderRadius: '10px',
                          marginBottom: '15px',
                          fontSize: '20px',
                          fontWeight: 'bold',
                          fontStyle: 'italic',
                          color: '#ffffff',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                          border: '3px solid #ff6b6b',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
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
                          padding: '30px',
                          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4a90e2 100%)',
                          borderRadius: '15px',
                          textAlign: 'center',
                          border: '3px solid #ff6b6b',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
                        }}>
                          <h3 style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            fontStyle: 'italic',
                            color: '#ffffff',
                            textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
                            marginBottom: '15px'
                          }}>
                            🎉 Congratulations! You won! 🎉
                          </h3>
                          <p style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#ffffff',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            marginBottom: '10px'
                          }}>
                            Time: {elapsedTime.toFixed(1)}s
                          </p>
                          {isMinting && (
                            <p style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '16px' }}>
                              Minting NFT for loser...
                            </p>
                          )}
                          {isSending && (
                            <p style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '16px' }}>
                              Sending reward to winner...
                            </p>
                          )}
                          {error && (
                            <p style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '16px' }}>
                              Error: {error}
                            </p>
                          )}
                          {!isMinting && !isSending && !error && (
                            <p style={{
                              color: '#4ade80',
                              fontWeight: 'bold',
                              fontSize: '18px',
                              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                            }}>
                              Rewards have been distributed! Winner gets the MON tokens.
                            </p>
                          )}
                          <button
                            onClick={resetGame}
                            style={{
                              marginTop: '20px',
                              padding: '15px 30px',
                              backgroundColor: '#ff6b6b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
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