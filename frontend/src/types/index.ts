export interface Player {
    id: string; // socketId or userId
    username: string;
    email?: string;
    isHost: boolean;
    isReady: boolean;
    role?: 'developer' | 'hacker';
    isAlive: boolean;
    color: string;
}

export interface GameSettings {
    maxPlayers: number;
    imposterCount: number;
    taskCount: number;
    discussionTime: number;
    votingTime: number;
}

export interface Lobby {
    id: string; // 6-character code
    hostId: string;
    players: Player[];
    settings: GameSettings;
    status: 'waiting' | 'starting' | 'in-progress' | 'meeting' | 'ended';
    createdAt: number;
}

// Socket Events
export interface ClientToServerEvents {
    'lobby:join': (lobbyId: string) => void;
    'lobby:leave': (lobbyId: string) => void;
    'player:ready': (lobbyId: string, isReady: boolean) => void;
    'game:start': (lobbyId: string) => void;
}

export interface ServerToClientEvents {
    'lobby:updated': (lobby: Lobby) => void;
    'player:joined': (player: Player) => void;
    'player:left': (playerId: string) => void;
    'error': (message: string) => void;
}
