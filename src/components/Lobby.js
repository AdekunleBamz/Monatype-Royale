import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { usePresence } from '../hooks/usePresence';
const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();
export const Lobby = () => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [currentRoom, setCurrentRoom] = useState('');
    const { players, join } = usePresence(currentRoom);
    const [mode, setMode] = useState('create');
    const [createdRoom, setCreatedRoom] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
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
            let roomToJoin;
            if (mode === 'create') {
                const newRoom = generateRoomId();
                setCreatedRoom(newRoom);
                roomToJoin = newRoom;
            }
            else {
                setCreatedRoom(null);
                roomToJoin = room.trim().toUpperCase();
            }
            setCurrentRoom(roomToJoin);
            join(name.trim());
        }
        catch (error) {
            console.error('Error joining room:', error);
            alert('Failed to join room. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const displayPlayers = currentRoom ? players : [];
    return (_jsxs("div", { className: "lobby", children: [_jsx("h1", { children: "Multiplayer Lobby" }), !currentRoom && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mode-selector", children: [_jsx("button", { type: "button", onClick: () => { setMode('create'); setCreatedRoom(null); }, className: `mode-button ${mode === 'create' ? 'active' : ''}`, children: "Create Game" }), _jsx("button", { type: "button", onClick: () => { setMode('join'); setCreatedRoom(null); }, className: `mode-button ${mode === 'join' ? 'active' : ''}`, children: "Join Game" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "join-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "name", children: "Your Name:" }), _jsx("input", { id: "name", type: "text", placeholder: "Enter your name", value: name, onChange: (e) => setName(e.target.value), maxLength: 20, required: true, disabled: isSubmitting })] }), mode === 'join' && (_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "room", children: "Room ID:" }), _jsx("input", { id: "room", type: "text", placeholder: "Enter room ID", value: room, onChange: (e) => setRoom(e.target.value.toUpperCase()), maxLength: 10, required: true, disabled: isSubmitting })] })), _jsx("button", { type: "submit", className: "submit-button", disabled: isSubmitting, children: isSubmitting ? 'Connecting...' : (mode === 'create' ? 'Create Room' : 'Join Room') })] }), createdRoom && (_jsxs("div", { className: "room-created", children: [_jsx("h3", { children: "\uD83C\uDF89 Room Created Successfully!" }), _jsx("p", { children: "Share this Room ID with others:" }), _jsxs("div", { className: "room-id-display", children: [_jsx("code", { children: createdRoom }), _jsx("button", { onClick: () => navigator.clipboard.writeText(createdRoom), className: "copy-button", title: "Copy to clipboard", children: "\uD83D\uDCCB" })] })] }))] })), _jsxs("div", { className: "player-list", children: [_jsxs("h3", { children: [currentRoom ? `Players in Room ${currentRoom}:` : 'Players:', _jsxs("span", { className: "player-count", children: ["(", displayPlayers.length, ")"] })] }), displayPlayers.length === 0 ? (_jsx("p", { className: "no-players", children: currentRoom ? 'Waiting for players to join...' : 'No players online' })) : (_jsx("ul", { className: "players", children: displayPlayers
                            .sort((a, b) => a.joinedAt - b.joinedAt)
                            .map((player) => (_jsxs("li", { className: "player-item", children: [_jsx("span", { className: "player-name", children: player.name }), _jsx("span", { className: "join-time", children: new Date(player.joinedAt).toLocaleTimeString() })] }, player.id))) }))] })] }));
};
