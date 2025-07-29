import { useState, useEffect } from 'react';
import { Session, MultisynqSession, View } from '@multisynq/client';
import { GameModel } from '../model/GameModel';
import { Player } from '../model/PresenceModel';

export interface GameState {
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  players: Player[];
  currentPrompt: string;
  winner: Player | null;
  loser: Player | null;
  countdown: number;
  startTime: number | null;
}

export const useGameState = (roomId: string, currentPlayer: Player | null) => {
  const [gameState, setGameState] = useState<GameState>({
    status: 'waiting',
    players: [],
    currentPrompt: '',
    winner: null,
    loser: null,
    countdown: 0,
    startTime: null
  });
  const [session, setSession] = useState<MultisynqSession<View> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !currentPlayer) {
      return;
    }

    const connectToGame = async () => {
      try {
        const response = await fetch('/api/key');
        const data = await response.json();
        const apiKey = data.apiKey;
        
        const newSession = await Session.join({
          apiKey,
          appId: import.meta.env.VITE_MULTISYNQ_APP_ID,
          name: `game-${roomId}`,
          password: 'typing-game-2024',
          model: GameModel,
        });

        setSession(newSession);
        console.log('Connected to game session');

        // Subscribe to game state updates
        newSession.view.subscribe('game', 'state:updated', (state: GameState) => {
          console.log('Game state updated:', state);
          setGameState(state);
        });

        newSession.view.subscribe('game', 'started', (state: GameState) => {
          console.log('Game started:', state);
          setGameState(state);
        });

        newSession.view.subscribe('game', 'finished', (state: GameState) => {
          console.log('Game finished:', state);
          setGameState(state);
        });

        return () => {
          newSession.leave();
        };
      } catch (err: any) {
        console.error('Failed to connect to game session:', err);
        setError(`Failed to connect: ${err.message}`);
      }
    };

    const cleanup = connectToGame();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [roomId, currentPlayer]);

  const startGame = (players: Player[]) => {
    if (session) {
      const prompts = [
        "My crypto dog dances better than your memecoin",
        "Left-curve liquidity lords live lavishly",
        "DeFi degens dream of decentralized dominance",
        "Yield farming feels like financial freedom",
        "Smart contracts solve society's struggles",
        "Blockchain believers build better businesses",
        "Tokenomics teach traders to think twice",
        "Web3 warriors win with wisdom",
        "Metaverse magic makes money move",
        "NFT ninjas navigate network nodes"
      ];
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      
      session.view.publish('game', 'start', {
        players,
        prompt: randomPrompt,
        startTime: Date.now() + 5000 // Start in 5 seconds
      });
    }
  };

  const updatePlayerProgress = (playerId: string, progress: number, wpm: number, accuracy: number) => {
    if (session) {
      session.view.publish('game', 'player:update', {
        playerId,
        progress,
        wpm,
        accuracy
      });
    }
  };

  const finishGame = (winner: Player, loser: Player) => {
    if (session) {
      session.view.publish('game', 'finish', {
        winner,
        loser,
        finishTime: Date.now()
      });
    }
  };

  const resetGame = () => {
    if (session) {
      session.view.publish('game', 'reset', {});
    }
  };

  return {
    gameState,
    error,
    startGame,
    updatePlayerProgress,
    finishGame,
    resetGame
  };
}; 