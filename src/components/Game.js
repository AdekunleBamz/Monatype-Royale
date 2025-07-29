import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { useRewards } from '../hooks/useRewards';
export const Game = ({ room, player, players, provider }) => {
    const { gameState, error, startGame, updatePlayer, finishGame } = useGame(room, player);
    const [inputValue, setInputValue] = useState('');
    const [startTime, setStartTime] = useState(null);
    const loser = gameState?.winner ? gameState.players.find(p => p.id !== gameState.winner?.id) : null;
    const { isMinting, isSending, error: rewardsError } = useRewards(provider, gameState?.winner || null, loser || null);
    useEffect(() => {
        if (players.length > 1 && !gameState) {
            startGame(players);
        }
    }, [players, gameState, startGame]);
    useEffect(() => {
        if (gameState?.status === 'in-progress' && !startTime) {
            setStartTime(Date.now());
        }
    }, [gameState, startTime]);
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (gameState && gameState.status === 'in-progress') {
            const prompt = gameState.prompt;
            const progress = (value.length / prompt.length) * 100;
            const elapsed = (Date.now() - (startTime || Date.now())) / 1000 / 60; // in minutes
            const wpm = (value.split(' ').length / elapsed) || 0;
            const accuracy = ((prompt.startsWith(value) ? value.length : 0) / value.length) * 100 || 0;
            updatePlayer({ id: player.id, progress, wpm, accuracy });
            if (value === prompt) {
                finishGame(player);
            }
        }
    };
    if (error) {
        return _jsxs("div", { className: "error", children: ["Error: ", error] });
    }
    if (!gameState) {
        return _jsx("div", { children: "Loading game..." });
    }
    return (_jsxs("div", { className: "game", children: [_jsx("h2", { children: "Typing Game" }), _jsxs("p", { children: [_jsx("strong", { children: "Prompt:" }), " ", gameState.prompt] }), _jsx("input", { type: "text", value: inputValue, onChange: handleInputChange, disabled: gameState.status !== 'in-progress', className: "game-input" }), _jsxs("div", { className: "game-players", children: [_jsx("h3", { children: "Players" }), _jsx("ul", { children: gameState.players.map((p) => (_jsxs("li", { children: [p.name, ": ", p.progress.toFixed(2), "% | ", p.wpm.toFixed(0), " WPM | ", p.accuracy.toFixed(0), "%"] }, p.id))) })] }), gameState.status === 'finished' && gameState.winner && (_jsxs("div", { className: "game-winner", children: [_jsx("h3", { children: "Game Over!" }), _jsxs("p", { children: ["Winner: ", gameState.winner.name] }), isMinting && _jsx("p", { children: "Minting NFT for the loser..." }), isSending && _jsx("p", { children: "Sending reward to the winner..." }), rewardsError && _jsxs("p", { className: "error", children: ["Error sending rewards: ", rewardsError] })] }))] }));
};
