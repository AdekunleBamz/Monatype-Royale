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
    // Add the player if they are not already in the list for that room
    if (!this.players.find(p => p.id === player.id && p.room === player.room)) {
      this.players.push(player);
    }
    // Always publish the full list of players for the specific room
    this.publish('room', 'presence:updated', this.getPlayersInRoom(player.room));
  }

  handlePlayerLeave(player: Player) {
    // Filter out the player who left
    this.players = this.players.filter(p => !(p.id === player.id && p.room === player.room));
    // Always publish the updated list of players for that room
    this.publish('room', 'presence:updated', this.getPlayersInRoom(player.room));
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
