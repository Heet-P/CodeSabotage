import { Server, Socket } from 'socket.io';
import { LobbyManager } from '../services/lobbyService';

const lobbyManager = LobbyManager.getInstance();

export const setupSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        socket.on('lobby:join', (lobbyId: string) => {
            const lobby = lobbyManager.getLobby(lobbyId);
            if (lobby) {
                socket.join(lobbyId);
                io.to(lobbyId).emit('lobby:updated', lobby);
                // Find player by some mapping if needed, or rely on client to send player info. 
                // For now, simple join doesn't add player to data model (REST API did that). 
                // We just subscribe to room updates here.
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            // Handle player disconnect/cleanup if needed
        });
    });
};
