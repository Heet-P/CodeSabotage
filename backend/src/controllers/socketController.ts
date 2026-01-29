import { Server, Socket } from 'socket.io';
import { LobbyManager } from '../services/lobbyService';
import { GameService } from '../services/gameService';

const lobbyManager = LobbyManager.getInstance();
const gameService = new GameService();

const meltdownTimers = new Map<string, NodeJS.Timeout>();

// Global Game Loop (1s Interval)
setInterval(() => {
    const lobbies = lobbyManager.getAllLobbies(); // Need to expose this or iterate somehow
    lobbies.forEach(lobby => {
        if (lobby.status === 'in-progress' && !lobby.isTimerPaused && (lobby.timeRemaining !== undefined)) {
            lobby.timeRemaining--;

            if (lobby.timeRemaining <= 0) {
                // Time Limit Exceeded - Hackers Win
                lobby.status = 'ended';
                (lobby as any).winner = 'hackers';
                (lobby as any).winReason = 'Time Limit Exceeded';

                // Emit Game Over
                // We need reference to 'io' here. 
                // Since this interval is outside setupSocketHandlers scope, we might need to move it or pass io.
            }
            // Optimization: Maybe don't emit every second if bandwidth is concern, but for game timer we usually do.
            // Or emit only on specific intervals?. For now, we rely on 'lobby:updated' via io.
        }
    });
}, 1000);

export const setupSocketHandlers = (io: Server) => {
    // Start the loop inside here to access 'io'
    setInterval(() => {
        // We can't easily get all lobbies from LobbyManager if it doesn't expose them.
        // Let's check LobbyManager.
    }, 1000);

    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        socket.on('lobby:join', (lobbyId: string) => {
            const lobby = lobbyManager.getLobby(lobbyId);
            if (lobby) {
                socket.join(lobbyId);
                io.to(lobbyId).emit('lobby:updated', lobby);
            }
        });

        socket.on('game:start', (lobbyId: string) => {
            try {
                console.log('Starting game for lobby:', lobbyId);
                const lobby = gameService.startGame(lobbyId);
                io.to(lobbyId).emit('lobby:updated', lobby);
                io.to(lobbyId).emit('game:started', lobby);
            } catch (e: any) {
                console.error('Error starting game:', e);
                socket.emit('error', e.message);
            }
        });

        socket.on('lobby:settings:update', ({ lobbyId, settings }: { lobbyId: string, settings: any }) => {
            try {
                const lobby = lobbyManager.updateSettings(lobbyId, settings);
                io.to(lobbyId).emit('lobby:updated', lobby);
            } catch (e: any) {
                socket.emit('error', e.message);
            }
        });

        socket.on('task:verify', ({ lobbyId, playerId, taskId, code }: { lobbyId: string, playerId: string, taskId: string, code: string }) => {
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
                } else {
                    socket.emit('task:error', result.message);
                }
            } catch (error: any) {
                socket.emit('error', error.message);
            }
        });

        socket.on('sabotage:trigger', ({ lobbyId, playerId, abilityId }: { lobbyId: string, playerId: string, abilityId: string }) => {
            console.log(`Sabotage triggered: ${abilityId} by ${playerId} in ${lobbyId}`);

            if (abilityId === 'meltdown') {
                try {
                    const lobby = gameService.triggerSabotage(lobbyId, 'meltdown');
                    io.to(lobbyId).emit('lobby:updated', lobby);

                    // Start Timer
                    if (meltdownTimers.has(lobbyId)) clearTimeout(meltdownTimers.get(lobbyId));

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
                } catch (e: any) {
                    socket.emit('error', e.message);
                    return;
                }
            }

            // Other Sabotage (Mocks)
            let duration = 0;
            if (abilityId === 'freeze') duration = 10;
            if (abilityId === 'bug') duration = 0; // Immediate effect
            if (abilityId === 'swap') duration = 15;

            // Broadcast to everyone in lobby (Developers will handle the effect)
            io.to(lobbyId).emit('sabotage:effect', { abilityId, duration });
        });

        socket.on('meeting:start', (lobbyId: string) => {
            console.log('Meeting triggered in lobby:', lobbyId);
            try {
                const lobby = gameService.startMeeting(lobbyId);
                io.to(lobbyId).emit('lobby:updated', lobby);
                io.to(lobbyId).emit('meeting:started', lobby);
            } catch (e: any) {
                console.error(e);
            }
        });

        socket.on('lobby:reset', (lobbyId: string) => {
            try {
                const lobby = gameService.resetLobby(lobbyId);
                io.to(lobbyId).emit('lobby:updated', lobby);
            } catch (e: any) {
                console.error(e);
            }
        });

        socket.on('vote:cast', ({ lobbyId, playerId, targetId }: { lobbyId: string, playerId: string, targetId: string | 'skip' }) => {
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
            // Handle player disconnect/cleanup if needed
        });
    });
};
