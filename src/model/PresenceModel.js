import { Model } from '@multisynq/client';
export class PresenceModel extends Model {
    init() {
        // Initialize the state if it's not already set.
        this.state.players = this.state.players || [];
        this.subscribe('room', 'player:join', this.handlePlayerJoin);
        this.subscribe('room', 'player:leave', this.handlePlayerLeave);
    }
    handlePlayerJoin(player) {
        // Use a Set for efficient duplicate checking.
        const playerIds = new Set(this.state.players.map(p => p.id));
        if (!playerIds.has(player.id)) {
            this.state.players.push(player);
        }
        // Publish the updated list of players for the specific room.
        this.publish('room', 'presence:updated', this.getPlayersInRoom(player.room));
    }
    handlePlayerLeave(player) {
        // Filter out the player who left.
        this.state.players = this.state.players.filter(p => p.id !== player.id);
        // Publish the updated list of players for the room.
        this.publish('room', 'presence:updated', this.getPlayersInRoom(player.room));
    }
    // Get players for a specific room.
    getPlayersInRoom(room) {
        // Ensure that we only return players for the requested room.
        return this.state.players.filter(p => p.room === room);
    }
    // Get all active rooms from the shared state.
    getActiveRooms() {
        const rooms = new Set(this.state.players.map(p => p.room));
        return Array.from(rooms);
    }
}
// Register the model for Multisynq
PresenceModel.register('PresenceModel');
