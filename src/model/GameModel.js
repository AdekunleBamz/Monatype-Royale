import { Model } from '@multisynq/client';
export class GameModel extends Model {
    init() {
        this.state.prompt = this.state.prompt || 'The quick brown fox jumps over the lazy dog.';
        this.state.players = this.state.players || [];
        this.state.status = this.state.status || 'waiting';
        this.state.winner = this.state.winner || null;
        this.subscribe('game', 'start', this.handleGameStart);
        this.subscribe('game', 'player:update', this.handlePlayerUpdate);
        this.subscribe('game', 'player:finish', this.handlePlayerFinish);
    }
    handleGameStart(players) {
        if (this.state.status === 'waiting') {
            this.state.players = players.map(p => ({ ...p, progress: 0, wpm: 0, accuracy: 0 }));
            this.state.status = 'in-progress';
            this.publish('game', 'started', this.state);
        }
    }
    handlePlayerUpdate(playerUpdate) {
        const player = this.state.players.find(p => p.id === playerUpdate.id);
        if (player) {
            player.progress = playerUpdate.progress;
            player.wpm = playerUpdate.wpm;
            player.accuracy = playerUpdate.accuracy;
            this.publish('game', 'state:updated', this.state);
        }
    }
    handlePlayerFinish(player) {
        if (this.state.status === 'in-progress' && !this.state.winner) {
            this.state.winner = player;
            this.state.status = 'finished';
            this.publish('game', 'finished', this.state);
        }
    }
}
GameModel.register('GameModel');
