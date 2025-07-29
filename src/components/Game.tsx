import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { Player } from '../model/PresenceModel';
import { GamePlayer } from '../model/GameModel';
import { useRewards } from '../hooks/useRewards';
import { ethers } from 'ethers';

interface GameProps {
  room: string;
  player: Player;
  players: Player[];
  provider: ethers.BrowserProvider | null;
}

export const Game: React.FC<GameProps> = ({ room, player, players, provider }) => {
  const { gameState, error, startGame, updatePlayer, finishGame } = useGame(room, player);
  const [inputValue, setInputValue] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const loser = gameState?.winner ? gameState.players.find(p => p.id !== gameState.winner?.id) : null;
  const { isMinting, isSending, error: rewardsError } = useRewards(provider, gameState?.winner || null, loser || null);


  useEffect(() => {
    if (players.length > 1 && !gameState) {
      startGame(players);
    }
  }, [players, gameState, startGame]);

  useEffect(() => {
    if (gameState?.status === 'in-progress' && !startTime) {
      setStartTime(Date.now());
    }
  }, [gameState, startTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (gameState && gameState.status === 'in-progress') {
      const prompt = gameState.prompt;
      const progress = (value.length / prompt.length) * 100;
      const elapsed = (Date.now() - (startTime || Date.now())) / 1000 / 60; // in minutes
      const wpm = (value.split(' ').length / elapsed) || 0;
      const accuracy = ((prompt.startsWith(value) ? value.length : 0) / value.length) * 100 || 0;

      updatePlayer({ id: player.id, progress, wpm, accuracy });

      if (value === prompt) {
        finishGame(player);
      }
    }
  };

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  return (
    <div className="game">
      <h2>Typing Game</h2>
      <p><strong>Prompt:</strong> {gameState.prompt}</p>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        disabled={gameState.status !== 'in-progress'}
        className="game-input"
      />
      <div className="game-players">
        <h3>Players</h3>
        <ul>
          {gameState.players.map((p: GamePlayer) => (
            <li key={p.id}>
              {p.name}: {p.progress.toFixed(2)}% | {p.wpm.toFixed(0)} WPM | {p.accuracy.toFixed(0)}%
            </li>
          ))}
        </ul>
      </div>
      {gameState.status === 'finished' && gameState.winner && (
        <div className="game-winner">
          <h3>Game Over!</h3>
          <p>Winner: {gameState.winner.name}</p>
          {isMinting && <p>Minting NFT for the loser...</p>}
          {isSending && <p>Sending reward to the winner...</p>}
          {rewardsError && <p className="error">Error sending rewards: {rewardsError}</p>}
        </div>
      )}
    </div>
  );
};
