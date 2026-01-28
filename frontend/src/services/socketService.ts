import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '../types';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

class SocketService {
    public socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

    public connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL);
        }
        return this.socket;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public joinLobby(lobbyId: string) {
        this.socket?.emit('lobby:join', lobbyId);
    }

    public leaveLobby(lobbyId: string) {
        this.socket?.emit('lobby:leave', lobbyId);
    }

    public startGame(lobbyId: string) {
        this.socket?.emit('game:start', lobbyId);
    }
}

export const socketService = new SocketService();
