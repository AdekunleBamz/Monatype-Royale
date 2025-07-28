import { useState, useEffect } from 'react';
import { Session } from '@multisynq/client';
import { PresenceModel, Player } from '../model/PresenceModel';

export const usePresence = (room: string, playerName: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [session, setSession] = useState<Session<PresenceModel> | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!room || !playerName) {
      setPlayers([]);
      if (session) {
        session.leave();
        setSession(null);
      }
      setIsConnected(false);
      return;
    }

    const joinSession = async () => {
      setError(null);
      try {
        console.log('VITE_MULTISYNQ_API_KEY:', import.meta.env.VITE_MULTISYNQ_API_KEY);
        console.log('VITE_MULTISYNQ_APP_ID:', import.meta.env.VITE_MULTISYNQ_APP_ID);
        const newSession = await Session.join<PresenceModel>({
          apiKey: import.meta.env.VITE_MULTISYNQ_API_KEY,
          appId: import.meta.env.VITE_MULTISYNQ_APP_ID,
          name: room,
          password: 'typing-game-2024',
          model: PresenceModel,
        });

        setSession(newSession as Session<PresenceModel>);
        setIsConnected(newSession.isConnected);

        const view = newSession.view;

        // Publish player join immediately after session is established
        const player: Player = {
          id: newSession.id,
          name: playerName,
          room,
          joinedAt: Date.now(),
        };
        view.publish('room', 'player:join', player); // Publish on the view object

        const unsubscribe = view.subscribe('room', 'presence:updated', (updatedPlayers: Player[]) => {
          setPlayers(updatedPlayers);
        });

        return () => {
          unsubscribe();
          // Only leave if the session is still active and not already left
          if (newSession && newSession.isConnected) {
            const playerToLeave: Player = {
              id: newSession.id,
              name: playerName,
              room,
              joinedAt: 0,
            };
            view.publish('room', 'player:leave', playerToLeave); // Publish on the view object
            newSession.leave();
          }
        };
      } catch (err: any) {
        console.error('Failed to join session:', err);
        setError(err.message || 'Failed to connect to room.');
        setIsConnected(false);
      }
    };

    joinSession();
  }, [room, playerName]);

  const leaveRoom = () => {
    if (session && session.isConnected) {
      session.leave();
      setSession(null);
      setIsConnected(false);
      setPlayers([]);
    }
  };

  return { players, isConnected, error, leaveRoom };
};
