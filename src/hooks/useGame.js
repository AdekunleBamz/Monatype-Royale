import { useState, useEffect } from 'react';
import { Session } from '@multisynq/client';
import { GameModel } from '../model/GameModel';
export const useGame = (room, player) => {
    const [gameState, setGameState] = useState(null);
    const [session, setSession] = useState(null);
    const [error, setError] = useState(null);
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
                view.subscribe('game', 'started', (state) => setGameState(state));
                view.subscribe('game', 'state:updated', (state) => setGameState(state));
                view.subscribe('game', 'finished', (state) => setGameState(state));
                return () => {
                    newSession.leave();
                };
            }
            catch (err) {
                console.error('Failed to join game session:', err);
                setError(err.message || 'Failed to connect to game.');
            }
        };
        joinSession();
    }, [room, player]);
    const startGame = (players) => {
        if (session) {
            session.view.publish('game', 'start', players);
        }
    };
    const updatePlayer = (update) => {
        if (session) {
            session.view.publish('game', 'player:update', update);
        }
    };
    const finishGame = (player) => {
        if (session) {
            session.view.publish('game', 'player:finish', player);
        }
    };
    return { gameState, error, startGame, updatePlayer, finishGame };
};
