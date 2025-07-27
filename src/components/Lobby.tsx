import React, { useState } from 'react';
import { usePresence } from '../hooks/usePresence';
import { Player } from '../model/PresenceModel';

const generateRoomId = (): string => Math.random().toString(36).substring(2, 8).toUpperCase();

export const Lobby: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [currentRoom, setCurrentRoom] = useState<string>('');
  const { players, join } = usePresence(currentRoom);
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [createdRoom, setCreatedRoom] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (mode === 'join' && !room.trim()) {
      alert('Please enter a room ID');
      return;
    }

    setIsSubmitting(true);

    try {
      let roomToJoin: string;
      if (mode === 'create') {
        const newRoom = generateRoomId();
        setCreatedRoom(newRoom);
        roomToJoin = newRoom;
      } else {
        setCreatedRoom(null);
        roomToJoin = room.trim().toUpperCase();
      }
      
      setCurrentRoom(roomToJoin);
      join(name.trim());

    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayPlayers = currentRoom ? players : [];

  return (
    <div className="lobby">
      <h1>Multiplayer Lobby</h1>
      
      {!currentRoom && (
        <>
          <div className="mode-selector">
            <button
              type="button"
              onClick={() => { setMode('create'); setCreatedRoom(null); }}
              className={`mode-button ${mode === 'create' ? 'active' : ''}`}
            >
              Create Game
            </button>
            <button
              type="button"
              onClick={() => { setMode('join'); setCreatedRoom(null); }}
              className={`mode-button ${mode === 'join' ? 'active' : ''}`}
            >
              Join Game
            </button>
          </div>

          <form onSubmit={handleSubmit} className="join-form">
            <div className="form-group">
              <label htmlFor="name">Your Name:</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                required
                disabled={isSubmitting}
              />
            </div>
            
            {mode === 'join' && (
              <div className="form-group">
                <label htmlFor="room">Room ID:</label>
                <input
                  id="room"
                  type="text"
                  placeholder="Enter room ID"
                  value={room}
                  onChange={(e) => setRoom(e.target.value.toUpperCase())}
                  maxLength={10}
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Connecting...' : (mode === 'create' ? 'Create Room' : 'Join Room')}
            </button>
          </form>

          {createdRoom && (
            <div className="room-created">
              <h3>🎉 Room Created Successfully!</h3>
              <p>Share this Room ID with others:</p>
              <div className="room-id-display">
                <code>{createdRoom}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(createdRoom)}
                  className="copy-button"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="player-list">
        <h3>
          {currentRoom ? `Players in Room ${currentRoom}:` : 'Players:'} 
          <span className="player-count">({displayPlayers.length})</span>
        </h3>
        
        {displayPlayers.length === 0 ? (
          <p className="no-players">
            {currentRoom ? 'Waiting for players to join...' : 'No players online'}
          </p>
        ) : (
          <ul className="players">
            {displayPlayers
              .sort((a, b) => a.joinedAt - b.joinedAt)
              .map((player) => (
                <li key={player.id} className="player-item">
                  <span className="player-name">{player.name}</span>
                  <span className="join-time">
                    {new Date(player.joinedAt).toLocaleTimeString()}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};
