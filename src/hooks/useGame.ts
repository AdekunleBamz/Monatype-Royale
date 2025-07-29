import { useState, useEffect } from 'react';
import { Session, MultisynqSession, View } from '@multisynq/client';
import { GameModel, GameState } from '../model/GameModel';
import { Player } from '../model/PresenceModel';

export const useGame = (room: string, player: Player) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [session, setSession] = useState<MultisynqSession<View> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!room || !player) {
      if (session) {
        session.leave();
        setSession(null);
      }
      setGameState(null);
      return;
    }

    const joinSession = async () => {
      setError(null);
      try {
        const newSession = await Session.join({
          apiKey: import.meta.env.VITE_MULTISYNQ_API_KEY,
          appId: import.meta.env.VITE_MULTISYNQ_APP_ID,
          name: `game-${room}`,
          password: 'typing-game-2024',
          model: GameModel,
        });

        setSession(newSession);

        const view = newSession.view;

        view.subscribe(
          'game',
          'started',
          (state: GameState) => setGameState(state),
        );
        view.subscribe(
          'game',
          'state:updated',
          (state: GameState) => setGameState(state),
        );
        view.subscribe(
          'game',
          'finished',
          (state: GameState) => setGameState(state),
        );

        return () => {
          newSession.leave();
        };
      } catch (err: any) {
        console.error('Failed to join game session:', err);
        setError(err.message || 'Failed to connect to game.');
      }
    };

    joinSession();
  }, [room, player]);

  const startGame = (players: Player[]) => {
    if (session) {
      session.view.publish('game', 'start', players);
    }
  };

  const updatePlayer = (update: { id: string; progress: number; wpm: number; accuracy: number }) => {
    if (session) {
      session.view.publish('game', 'player:update', update);
    }
  };

  const finishGame = (player: Player) => {
    if (session) {
      session.view.publish('game', 'player:finish', player);
    }
  };

  return { gameState, error, startGame, updatePlayer, finishGame };
};
