import { Model } from '@multisynq/client';
import { Player } from './PresenceModel';

export interface GamePlayer extends Player {
  progress: number; // Percentage of the prompt completed
  wpm: number; // Words per minute
  accuracy: number; // Accuracy percentage
}

export type GameStatus = 'waiting' | 'in-progress' | 'finished';

export interface GameState {
  prompt: string;
  players: GamePlayer[];
  status: GameStatus;
  winner: GamePlayer | null;
}

export class GameModel extends Model {
  state!: GameState;

  init() {
    this.state.prompt = this.state.prompt || 'The quick brown fox jumps over the lazy dog.';
    this.state.players = this.state.players || [];
    this.state.status = this.state.status || 'waiting';
    this.state.winner = this.state.winner || null;

    this.subscribe('game', 'start', this.handleGameStart);
    this.subscribe('game', 'player:update', this.handlePlayerUpdate);
    this.subscribe('game', 'player:finish', this.handlePlayerFinish);
  }

  handleGameStart(players: Player[]) {
    if (this.state.status === 'waiting') {
      this.state.players = players.map(p => ({ ...p, progress: 0, wpm: 0, accuracy: 0 }));
      this.state.status = 'in-progress';
      this.publish('game', 'started', this.state);
    }
  }

  handlePlayerUpdate(playerUpdate: { id: string; progress: number; wpm: number; accuracy: number }) {
    const player = this.state.players.find(p => p.id === playerUpdate.id);
    if (player) {
      player.progress = playerUpdate.progress;
      player.wpm = playerUpdate.wpm;
      player.accuracy = playerUpdate.accuracy;
      this.publish('game', 'state:updated', this.state);
    }
  }

  handlePlayerFinish(player: GamePlayer) {
    if (this.state.status === 'in-progress' && !this.state.winner) {
      this.state.winner = player;
      this.state.status = 'finished';
      this.publish('game', 'finished', this.state);
    }
  }
}

GameModel.register('GameModel');
