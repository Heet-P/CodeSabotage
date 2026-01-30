"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const lobbyService_1 = require("../services/lobbyService");
const gameService_1 = require("../services/gameService");
const lobbyManager = lobbyService_1.LobbyManager.getInstance();
const gameService = new gameService_1.GameService();
const meltdownTimers = new Map();
let gameLoopInterval = null;
const socketMap = new Map();
// Global Game Loop (1s Interval)
const setupSocketHandlers = (io) => {
    if (gameLoopInterval)
        clearInterval(gameLoopInterval);
    // Global Game Loop (1s Interval)
    gameLoopInterval = setInterval(() => {
        const lobbies = lobbyManager.getAllLobbies();
        lobbies.forEach(lobby => {
            if (lobby.status === 'in-progress' && !lobby.isTimerPaused && (lobby.timeRemaining !== undefined)) {
                lobby.timeRemaining--;
                if (lobby.timeRemaining <= 0) {
                    // Time Limit Exceeded - Hackers Win
                    lobby.status = 'ended';
                    lobby.winner = 'hackers';
                    lobby.winReason = 'Time Limit Exceeded';
                    io.to(lobby.id).emit('game:ended', lobby);
                }
                // Emit update to clients
                io.to(lobby.id).emit('lobby:updated', lobby);
            }
        });
    }, 1000);
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        socket.on('lobby:join', ({ lobbyId, playerId }) => {
            const lobby = lobbyManager.getLobby(lobbyId);
            if (lobby) {
                socket.join(lobbyId);
                socketMap.set(socket.id, { lobbyId, playerId });
                io.to(lobbyId).emit('lobby:updated', lobby);
            }
        });
        socket.on('lobby:leave', (lobbyId) => {
            const data = socketMap.get(socket.id);
            if (data) {
                const updatedLobby = lobbyManager.removePlayer(lobbyId, data.playerId);
                socket.leave(lobbyId);
                socketMap.delete(socket.id);
                if (updatedLobby) {
                    io.to(lobbyId).emit('lobby:updated', updatedLobby);
                }
            }
        });
        socket.on('game:start', (lobbyId) => {
            try {
                console.log('Starting game for lobby:', lobbyId);
                const lobby = gameService.startGame(lobbyId);
                io.to(lobbyId).emit('lobby:updated', lobby);
                io.to(lobbyId).emit('game:started', lobby);
            }
            catch (e) {
                console.error('Error starting game:', e);
                socket.emit('error', e.message);
            }
        });
        socket.on('lobby:settings:update', ({ lobbyId, settings }) => {
            try {
                const lobby = lobbyManager.updateSettings(lobbyId, settings);
                io.to(lobbyId).emit('lobby:updated', lobby);
            }
            catch (e) {
                socket.emit('error', e.message);
            }
        });
        socket.on('task:verify', ({ lobbyId, playerId, taskId, code }) => {
            try {
                const result = gameService.verifyTask(lobbyId, playerId, taskId, code);
                if (result.success) {
                    const lobby = lobbyManager.getLobby(lobbyId);
                    io.to(lobbyId).emit('lobby:updated', lobby);
                    socket.emit('task:success', taskId);
                    // Check if Sabotage was just resolved
                    if (lobby && !lobby.sabotage?.isActive && meltdownTimers.has(lobbyId)) {
                        console.log('Meltdown averted!');
                        clearTimeout(meltdownTimers.get(lobbyId));
                        meltdownTimers.delete(lobbyId);
                    }
                    if (lobby && lobby.status === 'ended') {
                        io.to(lobbyId).emit('game:ended', lobby);
                        // Also clear timer if ended
                        if (meltdownTimers.has(lobbyId)) {
                            clearTimeout(meltdownTimers.get(lobbyId));
                            meltdownTimers.delete(lobbyId);
                        }
                    }
                }
                else {
                    socket.emit('task:error', result.message);
                }
            }
            catch (error) {
                socket.emit('error', error.message);
            }
        });
        socket.on('sabotage:trigger', ({ lobbyId, playerId, abilityId }) => {
            console.log(`Sabotage triggered: ${abilityId} by ${playerId} in ${lobbyId}`);
            if (abilityId === 'meltdown') {
                try {
                    const lobby = gameService.triggerSabotage(lobbyId, 'meltdown');
                    io.to(lobbyId).emit('lobby:updated', lobby);
                    // Start Timer
                    if (meltdownTimers.has(lobbyId))
                        clearTimeout(meltdownTimers.get(lobbyId));
                    const timer = setTimeout(() => {
                        const updatedLobby = gameService.checkSabotageTimeout(lobbyId);
                        if (updatedLobby) {
                            io.to(lobbyId).emit('lobby:updated', updatedLobby);
                            io.to(lobbyId).emit('game:ended', updatedLobby);
                        }
                        meltdownTimers.delete(lobbyId);
                    }, 45000); // 45 Seconds
                    meltdownTimers.set(lobbyId, timer);
                    return;
                }
                catch (e) {
                    socket.emit('error', e.message);
                    return;
                }
            }
            // Other Sabotage (Mocks)
            let duration = 0;
            if (abilityId === 'freeze')
                duration = 10;
            if (abilityId === 'bug')
                duration = 0; // Immediate effect
            if (abilityId === 'swap')
                duration = 15;
            // Broadcast to everyone in lobby (Developers will handle the effect)
            io.to(lobbyId).emit('sabotage:effect', { abilityId, duration });
        });
        socket.on('meeting:start', (lobbyId) => {
            console.log('Meeting triggered in lobby:', lobbyId);
            try {
                const lobby = gameService.startMeeting(lobbyId);
                io.to(lobbyId).emit('lobby:updated', lobby);
                io.to(lobbyId).emit('meeting:started', lobby);
            }
            catch (e) {
                console.error(e);
            }
        });
        socket.on('lobby:reset', (lobbyId) => {
            try {
                const lobby = gameService.resetLobby(lobbyId);
                io.to(lobbyId).emit('lobby:updated', lobby);
            }
            catch (e) {
                console.error(e);
            }
        });
        socket.on('vote:cast', ({ lobbyId, playerId, targetId }) => {
            console.log(`Vote cast by ${playerId} for ${targetId}`);
            const result = gameService.castVote(lobbyId, playerId, targetId);
            if (result.success && result.lobby) {
                io.to(lobbyId).emit('lobby:updated', result.lobby);
                if (result.message) {
                    io.to(lobbyId).emit('meeting:ended', result.lobby);
                }
            }
        });
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            const data = socketMap.get(socket.id);
            if (data) {
                const { lobbyId, playerId } = data;
                console.log(`Removing player ${playerId} from lobby ${lobbyId} due to disconnect`);
                const updatedLobby = lobbyManager.removePlayer(lobbyId, playerId);
                socketMap.delete(socket.id);
                if (updatedLobby) {
                    io.to(lobbyId).emit('lobby:updated', updatedLobby);
                    io.to(lobbyId).emit('player:left', playerId);
                }
            }
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
