import { useState, useEffect } from 'react';
import { Session, MultisynqSession, View } from '@multisynq/client';
import { Player, PresenceModel } from '../model/PresenceModel';

export const usePresence = (roomId: string, playerName: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<MultisynqSession<View> | null>(null);

  useEffect(() => {
    console.log('usePresence effect triggered with roomId:', roomId, 'playerName:', playerName);
    if (!roomId || !playerName) {
      console.log('Missing roomId or playerName, skipping connection');
      return;
    }

    const connectToRoom = async () => {
      try {
        console.log('Multisynq version:', import.meta.env.VITE_MULTISYNQ_API_KEY ? 'API Key available' : 'API Key missing');
        
        // Use the API key directly from environment variable
        const apiKey = import.meta.env.VITE_MULTISYNQ_API_KEY;
        if (!apiKey) {
          throw new Error('Multisynq API key not found');
        }
        
        console.log('Attempting to join presence room:', `presence-${roomId}`);
        const newSession = await Session.join({
          apiKey,
          appId: import.meta.env.VITE_MULTISYNQ_APP_ID,
          name: `presence-${roomId}`,
          password: 'typing-game-2024',
          model: PresenceModel,
        });

        setSession(newSession);
        console.log('Connected to Multisynq');

        const currentPlayer: Player = {
          id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: playerName,
          joinedAt: Date.now()
        };

        setPlayerId(currentPlayer.id);
        setIsConnected(true);
        setError(null);

        // Add current player to the list immediately
        setPlayers(prev => {
          if (!prev.find(p => p.id === currentPlayer.id)) {
            return [...prev, currentPlayer];
          }
          return prev;
        });

        // Subscribe to room events
        newSession.view.subscribe('presence', 'player:join', (newPlayer: Player) => {
          console.log('Player joined:', newPlayer);
          setPlayers(prev => {
            if (!prev.find(p => p.id === newPlayer.id)) {
              return [...prev, newPlayer];
            }
            return prev;
          });
        });

        // Subscribe to state updates to get existing players
        newSession.view.subscribe('presence', 'state:updated', (state: any) => {
          console.log('Presence state updated:', state);
          if (state && state.players) {
            setPlayers(state.players);
          }
        });

        newSession.view.subscribe('presence', 'player:leave', (playerId: string) => {
          console.log('Player left:', playerId);
          setPlayers(prev => prev.filter(p => p.id !== playerId));
        });

        // Broadcast our presence
        newSession.view.publish('presence', 'player:join', currentPlayer);

        // Set up periodic presence update
        const interval = setInterval(() => {
          newSession.view.publish('presence', 'player:heartbeat', currentPlayer);
        }, 30000); // Every 30 seconds

        return () => {
          clearInterval(interval);
          newSession.view.publish('presence', 'player:leave', currentPlayer.id);
          newSession.leave();
        };
      } catch (err: any) {
        console.error('Failed to connect to Multisynq:', err);
        setError(`Failed to connect: ${err.message}`);
        setIsConnected(false);
      }
    };

    const cleanup = connectToRoom();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [roomId, playerName]);

  const leaveRoom = async () => {
    if (session) {
      try {
        session.view.publish('presence', 'player:leave', playerId);
        session.leave();
      } catch (err) {
        console.error('Error leaving room:', err);
      }
    }
    setIsConnected(false);
    setPlayers([]);
    setPlayerId(null);
    setSession(null);
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
    removePlayer,
    session
  };
}; 