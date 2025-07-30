import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { usePresence } from '../hooks/usePresence';
import { useDeposit } from '../hooks/useDeposit';
import { useGameState } from '../hooks/useGameState';
import { Game } from './Game';
import { Player } from '../model/PresenceModel';

interface GameRoomProps {
  provider: ethers.BrowserProvider | null;
  walletAddress: string | null;
}

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const GameRoom: React.FC<GameRoomProps> = ({ provider, walletAddress }) => {
  const [mode, setMode] = useState<'lobby' | 'create' | 'join' | 'game'>('lobby');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [loser, setLoser] = useState<Player | null>(null);

  const { isDepositing, depositError, hasDeposited, makeDeposit, checkDeposit, resetDeposit } = useDeposit(provider);
  const { players, playerId, isConnected, error, leaveRoom } = usePresence(roomCode, playerName);
  
  // Get current player for game state
  const currentPlayer = players.find(p => p.id === playerId) || null;
  const { startGame: startGameState } = useGameState(roomCode, currentPlayer);

  useEffect(() => {
    if (walletAddress) {
      setPlayerName(walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4));
    }
  }, [walletAddress]);

  useEffect(() => {
    if (provider) {
      checkDeposit();
    }
  }, [provider, checkDeposit]);

  const handleCreateGame = () => {
    // Check if user has deposited for this game
    if (!hasDeposited) {
      alert('You need to deposit 0.2 MON to create a new game');
      return;
    }
    const newRoomCode = generateRoomCode();
    setRoomCode(newRoomCode);
    setMode('create');
  };

  const handleJoinGame = () => {
    if (!joinCode.trim()) {
      alert('Please enter a room code');
      return;
    }
    // Check if user has deposited for this game
    if (!hasDeposited) {
      alert('You need to deposit 0.2 MON to join a game');
      return;
    }
    console.log('Joining room with code:', joinCode.toUpperCase());
    setRoomCode(joinCode.toUpperCase());
    setMode('create'); // Change to 'create' mode to show the game room
  };

  const startGame = () => {
    if (players.length < 2) {
      alert('Need at least 2 players to start the game');
      return;
    }
    console.log('Starting game with players:', players);
    startGameState(players);
    setGameStarted(true);
    setMode('game');
  };

  const handleGameFinish = (gameWinner: Player, gameLoser: Player) => {
    setWinner(gameWinner);
    setLoser(gameLoser);
  };

  const resetGame = () => {
    setMode('lobby');
    setRoomCode('');
    setJoinCode('');
    setGameStarted(false);
    setWinner(null);
    setLoser(null);
    resetDeposit(); // Reset deposit status for new game
    leaveRoom();
  };

  if (!hasDeposited) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Deposit Required</h2>
        <p>You need to deposit 0.2 MON to participate in games.</p>
        <button 
          onClick={makeDeposit}
          disabled={isDepositing}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isDepositing ? 'not-allowed' : 'pointer',
            opacity: isDepositing ? 0.6 : 1
          }}
        >
          {isDepositing ? 'Processing...' : 'Deposit 0.2 MON'}
        </button>
        {depositError && (
          <p style={{ color: 'red', marginTop: '10px' }}>{depositError}</p>
        )}
      </div>
    );
  }

  if (mode === 'lobby') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Monatype Royale</h2>
        <p>Welcome! You have deposited 0.2 MON and are ready to play.</p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
          <button 
            onClick={handleCreateGame}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Create Game
          </button>
          
          <button 
            onClick={() => setMode('join')}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Join Game
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    // Check if this room was joined (not created)
    const isJoinedRoom = joinCode && joinCode.length > 0;
    
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>{isJoinedRoom ? 'Joined Game Room' : 'Game Room Created'}</h2>
        <div style={{ 
          backgroundColor: '#f8f9fa',
          padding: '20px', 
          borderRadius: '8px',
          margin: '20px 0',
          border: '2px solid #2196F3'
        }}>
          <h3 style={{ color: '#000000', fontWeight: 'bold', marginBottom: '10px' }}>
            Room Code: {roomCode}
          </h3>
          <p style={{ color: '#000000', fontWeight: 'bold', fontSize: '16px' }}>
            {isJoinedRoom ? 'You have successfully joined the game room!' : 'Share this code with other players to join your game!'}
          </p>
        </div>
        
        {/* Connection Status */}
        {error && (
          <div style={{ 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '10px',
            border: '1px solid #ef5350'
          }}>
            Connection Error: {error}
          </div>
        )}
        
        {!isConnected && !error && (
          <div style={{ 
            backgroundColor: '#fff3e0', 
            color: '#ef6c00', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '10px',
            border: '1px solid #ff9800'
          }}>
            Connecting to room...
          </div>
        )}
        
        <div style={{ marginTop: '20px' }}>
          <h3>Players in Room:</h3>
          <div style={{ 
            textAlign: 'left', 
            maxWidth: '400px', 
            margin: '0 auto',
            backgroundColor: '#87CEEB',
            padding: '15px',
            borderRadius: '8px',
            border: '2px solid #4682B4'
          }}>
            {players.length === 0 ? (
              <p style={{ color: '#000000', textAlign: 'center', margin: '0' }}>
                {isConnected ? 'Waiting for players to join...' : 'Connecting to room...'}
              </p>
            ) : (
              players.map(player => (
                <div key={player.id} style={{ 
                  padding: '10px', 
                  margin: '5px 0', 
                  backgroundColor: '#ffffff',
                  borderRadius: '5px',
                  border: '1px solid #4682B4',
                  color: '#000000',
                  fontWeight: 'bold'
                }}>
                  {player.name} {player.id === playerId && '(You)'}
                </div>
              ))
            )}
          </div>
        </div>
        
        <button 
          onClick={startGame}
          disabled={players.length < 2}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: players.length >= 2 ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: players.length >= 2 ? 'pointer' : 'not-allowed',
            marginTop: '20px'
          }}
        >
          {players.length >= 2 ? 'Start Game' : `Need ${2 - players.length} more player(s)`}
        </button>
        
        <button 
          onClick={resetGame}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px',
            marginLeft: '10px'
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Join Game</h2>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Enter room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            style={{
              padding: '10px',
              fontSize: '16px',
              width: '200px',
              border: '2px solid #ddd',
              borderRadius: '5px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={handleJoinGame}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Join
          </button>
          
          <button 
            onClick={resetGame}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'game') {
    return (
      <div>
        <Game
          provider={provider}
          currentPlayer={currentPlayer}
          players={players}
          roomId={roomCode}
          onGameFinish={handleGameFinish}
          onReset={resetGame}
        />
      </div>
    );
  }

  return null;
}; 