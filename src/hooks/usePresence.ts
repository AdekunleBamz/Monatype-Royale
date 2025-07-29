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

    // For now, create a simple mock implementation
    const currentPlayer: Player = {
      id: `player-${Date.now()}`,
      name: playerName,
      joinedAt: Date.now()
    };

    setPlayerId(currentPlayer.id);
    setIsConnected(true);
    setError(null);
    setPlayers([currentPlayer]);

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