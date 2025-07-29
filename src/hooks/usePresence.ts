import { useState, useEffect } from 'react';
import { Player } from '../model/PresenceModel';

export const usePresence = (roomId: string, playerName: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !playerName) {
      return;
    }

    // Create a mock multiplayer implementation
    const currentPlayer: Player = {
      id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: playerName,
      joinedAt: Date.now()
    };

    setPlayerId(currentPlayer.id);
    setIsConnected(true);
    setError(null);
    
    // Add current player to the list
    setPlayers([currentPlayer]);

    // Simulate other players joining (for demo purposes)
    const mockPlayers = [
      { id: 'player-1', name: 'Alice', joinedAt: Date.now() - 1000 },
      { id: 'player-2', name: 'Bob', joinedAt: Date.now() - 2000 },
    ];

    // Only add mock players if this is a real room (not empty)
    if (roomId.length > 0) {
      setPlayers([currentPlayer, ...mockPlayers]);
    }

    return () => {
      setIsConnected(false);
      setPlayers([]);
      setPlayerId(null);
    };
  }, [roomId, playerName]);

  const leaveRoom = () => {
    setIsConnected(false);
    setPlayers([]);
    setPlayerId(null);
  };

  return {
    players,
    playerId,
    isConnected,
    error,
    leaveRoom
  };
}; 