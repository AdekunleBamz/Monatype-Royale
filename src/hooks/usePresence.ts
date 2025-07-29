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

    // Create a real player instance
    const currentPlayer: Player = {
      id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: playerName,
      joinedAt: Date.now()
    };

    setPlayerId(currentPlayer.id);
    setIsConnected(true);
    setError(null);
    
    // Start with just the current player
    setPlayers([currentPlayer]);

    // Simulate real-time updates (in a real implementation, this would be Multisynq)
    const interval = setInterval(() => {
      // This simulates other players joining the room
      // In a real Multisynq implementation, this would be handled by the server
      console.log(`Player ${currentPlayer.name} is in room ${roomId}`);
    }, 5000);

    return () => {
      clearInterval(interval);
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

  const addPlayer = (player: Player) => {
    setPlayers(prev => {
      if (!prev.find(p => p.id === player.id)) {
        return [...prev, player];
      }
      return prev;
    });
  };

  const removePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  return {
    players,
    playerId,
    isConnected,
    error,
    leaveRoom,
    addPlayer,
    removePlayer
  };
}; 