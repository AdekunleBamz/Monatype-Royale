import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRewards } from '../hooks/useRewards';
import { useGameState, GameState } from '../hooks/useGameState';
import { Player } from '../model/PresenceModel';

interface GameProps {
  provider: ethers.BrowserProvider | null;
  currentPlayer: Player | null;
  players: Player[];
  roomId: string;
  onGameFinish: (winner: Player, loser: Player) => void;
  onReset: () => void;
}

export const Game: React.FC<GameProps> = ({ provider, currentPlayer, players, roomId, onGameFinish, onReset }) => {
  const [userInput, setUserInput] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [countdown, setCountdown] = useState(5);

  const { gameState, error: gameError, updatePlayerProgress, finishGame } = useGameState(roomId, currentPlayer);
  const { isMinting, isSending, error: rewardsError } = useRewards(provider, gameState.winner, gameState.loser);

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
    if (gameState.status === 'playing' && gameState.startTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - gameState.startTime!) / 1000;
        setElapsedTime(elapsed);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameState.status, gameState.startTime]);

  useEffect(() => {
    if (gameState.status === 'countdown' && gameState.startTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((gameState.startTime! - now) / 1000));
        setCountdown(timeLeft);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.status, gameState.startTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (gameState.status !== 'playing') return;
    
    const value = e.target.value;
    setUserInput(value);
    
    // Calculate progress
    const progress = (value.length / gameState.currentPrompt.length) * 100;
    const words = value.split(' ').length;
    const timeInMinutes = elapsedTime / 60;
    const wpm = timeInMinutes > 0 ? words / timeInMinutes : 0;
    
    // Update progress in real-time
    if (currentPlayer) {
      updatePlayerProgress(currentPlayer.id, progress, wpm, 95); // 95% accuracy for now
    }
    
    if (value === gameState.currentPrompt) {
      // Player finished!
      if (currentPlayer) {
        // Find a random opponent as loser
        const opponents = players.filter(p => p.id !== currentPlayer.id);
        const randomLoser = opponents[Math.floor(Math.random() * opponents.length)] || {
          id: 'mock-loser',
          name: 'Opponent',
          joinedAt: Date.now()
        };
        finishGame(currentPlayer, randomLoser);
        onGameFinish(currentPlayer, randomLoser);
      }
    }
  };

  const resetGame = () => {
    setUserInput('');
    setElapsedTime(0);
    setCountdown(5);
    onReset();
  };

  if (!currentPlayer) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px'
      }}>
        <p style={{ color: '#856404', margin: '0' }}>
          <strong>Please connect your wallet to play.</strong>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Monatype Royale</h2>
      
      {gameState.status === 'waiting' ? (
        <div>
          <p>Ready to type your way to victory?</p>
          <p>Waiting for other players to join...</p>
        </div>
      ) : gameState.status === 'countdown' ? (
        <div style={{ textAlign: 'center' }}>
          <h3>Game starting in...</h3>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff6b6b' }}>
            {countdown}
          </div>
        </div>
      ) : gameState.status === 'playing' ? (
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
              {gameState.currentPrompt}
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
            disabled={gameState.status !== 'playing'}
          />
          
          {gameState.status === ('finished' as any) && gameState.winner && (
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
              {rewardsError && (
                <p style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '16px' }}>
                  Error: {rewardsError}
                </p>
              )}
              {!isMinting && !isSending && !rewardsError && (
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
      ) : gameState.status === 'finished' ? (
        <div style={{ textAlign: 'center' }}>
          <h3>Game Finished!</h3>
          <p>Winner: {gameState.winner?.name || 'Unknown'}</p>
          <button onClick={resetGame} style={{
            padding: '15px 30px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Play Again
          </button>
        </div>
      ) : null}
    </div>
  );
}; 