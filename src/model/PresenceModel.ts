import { Model } from '@multisynq/client';

export interface Player {
  id: string;
  name: string;
  room: string;
  joinedAt: number;
}

export class PresenceModel extends Model {
  players!: Player[];

  init() {
    this.players = [];
    this.subscribe('room', 'player:join', this.handlePlayerJoin);
    this.subscribe('room', 'player:leave', this.handlePlayerLeave);
  }

  handlePlayerJoin(player: Player) {
    if (!this.players.find(p => p.id === player.id && p.room === player.room)) {
      this.players.push(player);
      this.publish('room', 'presence:updated', this.players);
    }
  }

  handlePlayerLeave(player: Player) {
    this.players = this.players.filter(p => !(p.id === player.id && p.room === player.room));
    this.publish('room', 'presence:updated', this.players);
  }

  // Get players for a specific room
  getPlayersInRoom(room: string): Player[] {
    return this.players.filter(p => p.room === room);
  }

  // Get all active rooms
  getActiveRooms(): string[] {
    const rooms = new Set(this.players.map(p => p.room));
    return Array.from(rooms);
  }
}

// Register the model for Multisynq
PresenceModel.register('PresenceModel');
