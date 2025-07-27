import { useState, useEffect } from 'react';
import * as Multisynq from '@multisynq/client';
import { PresenceModel, Player } from '../model/PresenceModel';

export const usePresence = (room: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [session, setSession] = useState<any | null>(null);

  useEffect(() => {
    if (!room) return;

    const joinSession = async () => {
      try {
        const newSession = await Multisynq.Session.join({
          apiKey: '2bM9si987s2y1JmC1RVV42EPPhaxFFrjqezB5ZJiyA', // Replace with your API key
          appId: 'io.multisynq.typing-game',
          name: room,
          password: 'typing-game-2024',
          model: PresenceModel,
        });

        setSession(newSession);

        const view = newSession.view as any;

        const unsubscribe = view.subscribe('room', 'presence:updated', (updatedPlayers: Player[]) => {
          setPlayers(updatedPlayers);
        });

        return () => {
          unsubscribe();
          newSession.leave();
        };
      } catch (error) {
        console.error('Failed to join session:', error);
      }
    };

    joinSession();
  }, [room]);

  const join = (name: string) => {
    if (session) {
      const player: Player = {
        id: session.viewId,
        name,
        room,
        joinedAt: Date.now(),
      };
      session.publish('room', 'player:join', player);
    }
  };

  const leave = () => {
    if (session) {
      const player: Player = {
        id: session.viewId,
        name: '', // Name is not needed to leave
        room,
        joinedAt: 0,
      };
      session.publish('room', 'player:leave', player);
      session.leave();
    }
  };

  return { players, join, leave };
};
