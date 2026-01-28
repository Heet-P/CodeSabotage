import { Server, Socket } from 'socket.io';
import { LobbyManager } from '../services/lobbyService';
import { GameService } from '../services/gameService';

const lobbyManager = LobbyManager.getInstance();
const gameService = new GameService();

export const setupSocketHandlers = (io: Server) => {
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

        socket.on('task:verify', ({ lobbyId, playerId, taskId, code }: { lobbyId: string, playerId: string, taskId: string, code: string }) => {
            try {
                const result = gameService.verifyTask(lobbyId, playerId, taskId, code);
                if (result.success) {
                    const lobby = lobbyManager.getLobby(lobbyId);
                    io.to(lobbyId).emit('lobby:updated', lobby);
                    socket.emit('task:success', taskId);

                    if (lobby && lobby.status === 'ended') {
                        io.to(lobbyId).emit('game:ended', lobby);
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

            // In a real implementation, we should verify cooldowns and role here via GameService
            // For now, we trust the client's cooldown (MVP) and just broadcast

            let duration = 0;
            if (abilityId === 'freeze') duration = 10;
            if (abilityId === 'bug') duration = 0; // Immediate effect
            if (abilityId === 'swap') duration = 15;

            // Broadcast to everyone in lobby (Develoeprs will handle the effect)
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
