export interface Player {
    id: string; // socketId or userId
    username: string;
    email?: string;
    isHost: boolean;
    isReady: boolean;
    role?: 'developer' | 'hacker';
    isAlive: boolean;
    color: string;
    tasks?: Task[];
}

export interface Task {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    completed: boolean;
    codeSnippet?: string;
    testCases?: any[];
}

export interface Vote {
    voterId: string;
    targetId: string | 'skip';
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
    taskProgress?: number;
    winner?: 'developers' | 'hackers';
    winReason?: string;
}

// Socket Events
export interface ClientToServerEvents {
    'lobby:join': (lobbyId: string) => void;
    'lobby:leave': (lobbyId: string) => void;
    'player:ready': (lobbyId: string, isReady: boolean) => void;
    'game:start': (lobbyId: string) => void;
    "task:verify": (payload: { lobbyId: string, playerId: string, taskId: string, code: string }) => void;
    'sabotage:trigger': (data: { lobbyId: string, playerId: string, abilityId: string }) => void;
    'meeting:start': (lobbyId: string) => void;
    'vote:cast': (data: { lobbyId: string, playerId: string, targetId: string | 'skip' }) => void;
    'lobby:reset': (lobbyId: string) => void;
}

export interface ServerToClientEvents {
    'lobby:updated': (lobby: Lobby) => void;
    'player:joined': (player: Player) => void;
    'player:left': (playerId: string) => void;
    'error': (message: string) => void;
    'game:started': (lobby: Lobby) => void;
    "task:success": (taskId: string) => void;
    "task:error": (message: string) => void;
    'sabotage:effect': (data: { abilityId: string, duration: number }) => void;
    'meeting:started': (lobby: Lobby) => void;
    'meeting:ended': (lobby: Lobby) => void;
    'game:ended': (lobby: Lobby) => void;
}
