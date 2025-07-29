import { Model } from '@multisynq/client';

export interface Player {
  id: string;
  name: string;
  joinedAt: number;
}

export interface PresenceState {
  players: Player[];
  roomId: string;
}

export class PresenceModel extends Model {
  state!: PresenceState;

  init() {
    // Initialize state first to prevent undefined errors
    this.state = this.state || { players: [], roomId: '' };
    this.state.players = this.state.players || [];
    this.state.roomId = this.state.roomId || '';

    this.subscribe('presence', 'player:join', this.handlePlayerJoin);
    this.subscribe('presence', 'player:leave', this.handlePlayerLeave);
  }

  handlePlayerJoin(player: Player) {
    if (!this.state.players.find(p => p.id === player.id)) {
      this.state.players.push(player);
      this.publish('presence', 'state:updated', this.state);
    }
  }

  handlePlayerLeave(playerId: string) {
    this.state.players = this.state.players.filter(p => p.id !== playerId);
    this.publish('presence', 'state:updated', this.state);
  }

  joinRoom(roomId: string, player: Player) {
    this.state.roomId = roomId;
    this.handlePlayerJoin(player);
  }

  leaveRoom(playerId: string) {
    this.handlePlayerLeave(playerId);
  }
}

PresenceModel.register('PresenceModel'); 