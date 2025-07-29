import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { usePresence } from '../hooks/usePresence';
import { Game } from './Game';
import WalletProviderSelector from './WalletProviderSelector';
import { useDeposit } from '../hooks/useDeposit';
const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();
export const Lobby = () => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const { players, playerId, isConnected, error, leaveRoom } = usePresence(room, name);
    const [mode, setMode] = useState('create');
    const [createdRoom, setCreatedRoom] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [provider, setProvider] = useState(null);
    const { isDepositing, depositError, hasDeposited, makeDeposit, checkDeposit } = useDeposit(provider);
    useEffect(() => {
        if (provider) {
            checkDeposit();
        }
    }, [provider, checkDeposit]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Please enter your name');
            return;
        }
        if (!hasDeposited) {
            alert('Please deposit 0.2 MON to start the game.');
            return;
        }
        if (mode === 'join' && !room.trim()) {
            alert('Please enter a room ID');
            return;
        }
        setIsSubmitting(true);
        try {
            if (mode === 'create') {
                const newRoom = generateRoomId();
                setRoom(newRoom);
                setCreatedRoom(newRoom);
            }
            // For 'join' mode, the room state is already set by the input field
            // The usePresence hook will automatically join when the room is set.
        }
        catch (error) {
            console.error('Error joining room:', error);
            alert('Failed to join room. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const displayPlayers = room ? players : [];
    const currentPlayer = playerId ? players.find(p => p.id === playerId) : null;
    if (room && currentPlayer) {
        return _jsx(Game, { room: room, player: currentPlayer, players: players, provider: provider });
    }
    return (_jsxs("div", { className: "lobby", children: [_jsx(WalletProviderSelector, { onProviderSelected: setProvider }), _jsx("h1", { children: "Multiplayer Lobby" }), provider && !hasDeposited && (_jsxs("div", { className: "deposit-section", children: [_jsx("p", { children: "You need to deposit 0.2 MON to play." }), _jsx("button", { onClick: makeDeposit, disabled: isDepositing || !provider, children: isDepositing ? 'Depositing...' : 'Deposit 0.2 MON' }), depositError && _jsx("p", { className: "error", children: depositError })] })), !room && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mode-selector", children: [_jsx("button", { type: "button", onClick: () => { setMode('create'); setCreatedRoom(null); }, className: `mode-button ${mode === 'create' ? 'active' : ''}`, children: "Create Game" }), _jsx("button", { type: "button", onClick: () => { setMode('join'); setCreatedRoom(null); }, className: `mode-button ${mode === 'join' ? 'active' : ''}`, children: "Join Game" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "join-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "name", children: "Your Name:" }), _jsx("input", { id: "name", type: "text", placeholder: "Enter your name", value: name, onChange: (e) => setName(e.target.value), maxLength: 20, required: true, disabled: isSubmitting })] }), mode === 'join' && (_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "room", children: "Room ID:" }), _jsx("input", { id: "room", type: "text", placeholder: "Enter room ID", value: room, onChange: (e) => setRoom(e.target.value.toUpperCase()), maxLength: 10, required: true, disabled: isSubmitting })] })), _jsx("button", { type: "submit", className: "submit-button", disabled: isSubmitting, children: isSubmitting ? 'Connecting...' : (mode === 'create' ? 'Create Room' : 'Join Room') })] }), createdRoom && (_jsxs("div", { className: "room-created", children: [_jsx("h3", { children: "\uD83C\uDF89 Room Created Successfully!" }), _jsx("p", { children: "Share this Room ID with others:" }), _jsxs("div", { className: "room-id-display", children: [_jsx("code", { children: createdRoom }), _jsx("button", { onClick: () => navigator.clipboard.writeText(createdRoom), className: "copy-button", title: "Copy to clipboard", children: "\uD83D\uDCCB" })] })] }))] })), room && (_jsx("div", { className: "room-controls", children: _jsx("button", { type: "button", onClick: () => {
                        leaveRoom();
                        setRoom('');
                        setCreatedRoom(null);
                    }, className: "leave-button", children: "Leave Room" }) })), _jsxs("div", { className: "player-list", children: [_jsxs("h3", { children: [room ? `Players in Room ${room}:` : 'Players:', _jsxs("span", { className: "player-count", children: ["(", displayPlayers.length, ")"] })] }), displayPlayers.length === 0 ? (_jsx("p", { className: "no-players", children: room ? 'Waiting for players to join...' : 'No players online' })) : (_jsx("ul", { className: "players", children: displayPlayers
                            .sort((a, b) => a.joinedAt - b.joinedAt)
                            .map((player) => (_jsxs("li", { className: "player-item", children: [_jsx("span", { className: "player-name", children: player.name }), _jsx("span", { className: "join-time", children: new Date(player.joinedAt).toLocaleTimeString() })] }, player.id))) }))] })] }));
};
